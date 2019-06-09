#include <vector>
#include <sys/ptrace.h>
#include <sys/wait.h>
#include <unistd.h>
#include <sstream>
#include <fstream>
#include <iostream>
#include <iomanip>
#include <inttypes.h>


#include "linenoise.h"

#include "debugger.hpp"
#include "registers.hpp"

using namespace minidbg;

class ptrace_expr_context : public dwarf::expr_context {
public:
    ptrace_expr_context(pid_t pid) : m_pid{pid} {}

    dwarf::taddr reg(unsigned regnum) override {
        return get_register_value_from_dwarf_register(m_pid, regnum);
    }

    dwarf::taddr pc() override {
        struct user_regs_struct regs;
        ptrace(PTRACE_GETREGS, m_pid, nullptr, &regs);
        return regs.rip;
    }

    dwarf::taddr deref_size(dwarf::taddr address, unsigned size) override {
        //TODO take into account size
        return ptrace(PTRACE_PEEKDATA, m_pid, address, nullptr);
    }

private:
    pid_t m_pid;
};

//dump tree call:
//for (auto cu : m_dwarf.compilation_units()) {
//        printf("--- <%" PRIx64 ">\n", cu.get_section_offset());
//        dump_tree(cu.root());
//    }
void
dump_tree(const dwarf::die &node, int depth = 0)
{
    printf("%*.s<%" PRIx64 "> %s\n", depth, "",
            node.get_section_offset(),
            to_string(node.tag).c_str());

    for (auto &attr : node.attributes())
        printf("%*.s      %s %s\n", depth, "",
               to_string(attr.first).c_str(),
               to_string(attr.second).c_str());
    for (auto &child : node)
        dump_tree(child, depth + 1);
}

int getHex(std::string hexstr) {
    return (int)strtol(hexstr.c_str(), 0, 16);
}

void
find_node(int & result, dwarf::value val, const dwarf::die &node, int depth = 0)
{
    using namespace dwarf;
    long length = to_string(val).size();
    char *buff;
    buff= new char[length];
    sprintf(buff, "<0x%" PRIx64 ">", node.get_section_offset());

    if(strcmp(buff, to_string(val).c_str()) == 0) {
        int size = 0;
        if(node.tag == DW_TAG::base_type) {
            value byte_size = node[DW_AT::byte_size];
            std::string string_byte_size = to_string(byte_size);
            size = getHex(string_byte_size);
        }
        result = size;

    }
    for (auto &child : node)
        find_node(result, val, child, depth + 1);
}

int debugger::findVariableSize(int *result, dwarf::value val) {
    using namespace dwarf;
        for (auto cu : m_dwarf.compilation_units()) {
            find_node(*result,val, cu.root());
    }
}

void debugger::read_variables() {
    using namespace dwarf;

    auto pc = get_pc();



    auto func = get_function_from_pc(pc);

    if(func.valid()) {
        for (const auto &die : func) {
            if (die.tag == DW_TAG::variable) {
                 value loc_val = die[DW_AT::location];
                 int size;
                value type = die[DW_AT::type];
                findVariableSize(&size, type);

                if (loc_val.get_type() == value::type::exprloc) {
                    ptrace_expr_context context{m_pid};
                    expr_result result = loc_val.as_exprloc().evaluate(&context);

                    switch (result.location_type) {
                        case expr_result::type::address: {
                            uint64_t value = read_memory(result.value);
                            char *buff;
                            buff= new char[21];
                            sprintf(buff, "%" PRIx64, value);

                            std::string str = std::string(buff);
                            if(str.size()>2*size){
                                str.erase(0, str.size() - 2*size);
                            } //values are in hex
                            std::cout << at_name(die) << " (0x" << std::hex << result.value << ") = " <<str
                                      << std::endl;
                            break;
                        }

                        case expr_result::type::reg: {
                            auto value = get_register_value_from_dwarf_register(m_pid, result.value);
                            std::cout << at_name(die) << " (reg " << result.value << ") = " << value << std::endl;
                            break;
                        }

                        default:
                            throw std::runtime_error{"Unhandled variable location"};
                    }
                } else {
                    throw std::runtime_error{"Unhandled variable location"};
                }
            }
        }
    }
}


void debugger::print_backtrace() {
    auto output_frame = [frame_number = 0](auto &&func) mutable {
        std::cout << "frame #" << frame_number++ << ": 0x" << dwarf::at_low_pc(func)
                  << ' ' << dwarf::at_name(func) << std::endl;
    };

    auto current_func = get_function_from_pc(get_pc());
    output_frame(current_func);

    auto frame_pointer = get_register_value(m_pid, reg::rbp);
    auto return_address = read_memory(frame_pointer + 8);

    while (dwarf::at_name(current_func) != "main") {
        current_func = get_function_from_pc(return_address);
        output_frame(current_func);
        frame_pointer = read_memory(frame_pointer);
        return_address = read_memory(frame_pointer + 8);
    }
}

symbol_type to_symbol_type(elf::stt sym) {
    switch (sym) {
        case elf::stt::notype:
            return symbol_type::notype;
        case elf::stt::object:
            return symbol_type::object;
        case elf::stt::func:
            return symbol_type::func;
        case elf::stt::section:
            return symbol_type::section;
        case elf::stt::file:
            return symbol_type::file;
        default:
            return symbol_type::notype;
    }
};

std::vector<symbol> debugger::lookup_symbol(const std::string &name) {
    std::vector<symbol> syms;

    for (auto &sec : m_elf.sections()) {
        if (sec.get_hdr().type != elf::sht::symtab && sec.get_hdr().type != elf::sht::dynsym)
            continue;

        for (auto sym : sec.as_symtab()) {
            if (sym.get_name() == name) {
                auto &d = sym.get_data();
                syms.push_back(symbol{to_symbol_type(d.type()), sym.get_name(), d.value});
            }
        }
    }

    return syms;
}

void debugger::remove_breakpoint(std::intptr_t addr) {
    if (m_breakpoints.at(addr).is_enabled()) {
        m_breakpoints.at(addr).disable();
    }
    m_breakpoints.erase(addr);
}

void debugger::step_out() {
    auto frame_pointer = get_register_value(m_pid, reg::rbp);
    auto return_address = read_memory(frame_pointer + 8);

    bool should_remove_breakpoint = false;
    if (!m_breakpoints.count(return_address)) {
        set_breakpoint_at_address(return_address);
        should_remove_breakpoint = true;
    }

    continue_execution();

    if (should_remove_breakpoint) {
        remove_breakpoint(return_address);
    }
}

void debugger::step_in() {
    auto line = get_line_entry_from_pc(get_pc())->line;

    while (get_line_entry_from_pc(get_pc())->line == line) {
        single_step_instruction_with_breakpoint_check();
    }

    auto line_entry = get_line_entry_from_pc(get_pc());
    print_source(line_entry->file->path, line_entry->line);
}

void debugger::step_over() {
    auto func = get_function_from_pc(get_pc());
    auto func_entry = at_low_pc(func);
    auto func_end = at_high_pc(func);

    auto line = get_line_entry_from_pc(func_entry);
    auto start_line = get_line_entry_from_pc(get_pc());

    std::vector<std::intptr_t> to_delete{};

    while (line->address < func_end) {
        if (line->address != start_line->address && !m_breakpoints.count(line->address)) {
            set_breakpoint_at_address(line->address);
            to_delete.push_back(line->address);
        }
        ++line;
    }

    auto frame_pointer = get_register_value(m_pid, reg::rbp);
    auto return_address = read_memory(frame_pointer + 8);
    if (!m_breakpoints.count(return_address)) {
        set_breakpoint_at_address(return_address);
        to_delete.push_back(return_address);
    }

    continue_execution();

    for (auto addr : to_delete) {
        remove_breakpoint(addr);
    }
}

void debugger::single_step_instruction() {
    ptrace(PTRACE_SINGLESTEP, m_pid, nullptr, nullptr);
    wait_for_signal();
}

void debugger::single_step_instruction_with_breakpoint_check() {
    //first, check to see if we need to disable and enable a breakpoint
    if (m_breakpoints.count(get_pc())) {
        step_over_breakpoint();
    } else {
        single_step_instruction();
    }
}

uint64_t debugger::read_memory(uint64_t address) {
    return ptrace(PTRACE_PEEKDATA, m_pid, address, nullptr);
}

void debugger::write_memory(uint64_t address, uint64_t value) {
    ptrace(PTRACE_POKEDATA, m_pid, address, value);
}

uint64_t debugger::get_pc() {
    return get_register_value(m_pid, reg::rip);
}

void debugger::set_pc(uint64_t pc) {
    set_register_value(m_pid, reg::rip, pc);
}

dwarf::die debugger::get_function_from_pc(uint64_t pc) {
    for (auto &cu : m_dwarf.compilation_units()) {
        if (die_pc_range(cu.root()).contains(pc)) {
            for (const auto &die : cu.root()) {
                if (die.tag == dwarf::DW_TAG::subprogram) {
                    auto range = die_pc_range(die);
                    if (range.contains(pc)) {
                        return die;
                    }
                }
            }
        }
    }
    std::cout<<"Cannot find any variables\n";
    return dwarf::die();
}

dwarf::line_table::iterator debugger::get_line_entry_from_pc(uint64_t pc) {
    for (auto &cu : m_dwarf.compilation_units()) {
        if (die_pc_range(cu.root()).contains(pc)) {
            auto &lt = cu.get_line_table();
            auto it = lt.find_address(pc);
            if (it == lt.end()) {
                throw std::out_of_range{"Cannot find line entry"};
            } else {
                return it;
            }
        }
    }

    throw std::out_of_range{"Cannot find line entry"};
}

void debugger::print_source(const std::string &file_name, unsigned line, unsigned n_lines_context) {
    std::ifstream file{file_name};

    //Work out a window around the desired line
    auto start_line = line <= n_lines_context ? 1 : line - n_lines_context;
    auto end_line = line + n_lines_context + (line < n_lines_context ? n_lines_context - line : 0) + 1;

    char c{};
    auto current_line = 1u;
    //Skip lines up until start_line
    while (current_line != start_line && file.get(c)) {
        if (c == '\n') {
            ++current_line;
        }
    }

    //Output cursor if we're at the current line
    std::cout << (current_line == line ? "> " : "  ");

    //Write lines up until end_line
    while (current_line <= end_line && file.get(c)) {
        std::cout << c;
        if (c == '\n') {
            ++current_line;
            //Output cursor if we're at the current line
            std::cout << (current_line == line ? "> " : "  ");
        }
    }

    //Write newline and make sure that the stream is flushed properly
    std::cout << std::endl;
}

siginfo_t debugger::get_signal_info() {
    siginfo_t info;
    ptrace(PTRACE_GETSIGINFO, m_pid, nullptr, &info);
    return info;
}

void debugger::step_over_breakpoint() {
    if (m_breakpoints.count(get_pc())) {
        auto &bp = m_breakpoints[get_pc()];
        if (bp.is_enabled()) {
            bp.disable();
            ptrace(PTRACE_SINGLESTEP, m_pid, nullptr, nullptr);
            wait_for_signal();
            bp.enable();
        }
    }
}

void debugger::wait_for_signal() {
    int wait_status;
    auto options = 0;
    waitpid(m_pid, &wait_status, options);

    auto siginfo = get_signal_info();

    switch (siginfo.si_signo) {
        case SIGTRAP:
            handle_sigtrap(siginfo);
            break;
        case SIGSEGV:
            std::cout << "Yay, segfault. Reason: " << siginfo.si_code << std::endl;
            break;
        default:
            std::cout << "Got signal " << strsignal(siginfo.si_signo) << std::endl;
    }
}

void debugger::handle_sigtrap(siginfo_t info) {
    switch (info.si_code) {
        //one of these will be set if a breakpoint was hit
        case SI_KERNEL:
        case TRAP_BRKPT: {
            set_pc(get_pc() - 1);
            std::cout << "Hit breakpoint at address 0x" << std::hex << get_pc() << std::endl;
            auto line_entry = get_line_entry_from_pc(get_pc());
            print_source(line_entry->file->path, line_entry->line);
            return;
        }
            //this will be set if the signal was sent by single stepping
        case TRAP_TRACE:
            return;
        default:
            std::cout << "Unknown SIGTRAP code " << info.si_code << std::endl;
            return;
    }
}


void debugger::continue_execution() {
    step_over_breakpoint();
    ptrace(PTRACE_CONT, m_pid, nullptr, nullptr);
    wait_for_signal();
}


//wypisz wartosci wszystkich rejestrow
void debugger::dump_registers() {
    for (const auto &rd : g_register_descriptors) {
        std::cout << rd.name << " 0x"
                  << std::setfill('0') << std::setw(16) << std::hex << get_register_value(m_pid, rd.r) << std::endl;
    }
}


//helpers
std::vector<std::string> split(const std::string &s, char delimiter) {
    std::vector<std::string> out{};
    std::stringstream ss {s};
    std::string item;

    while (std::getline(ss,item,delimiter)) {
        out.push_back(item);
    }

    return out;
}

bool is_prefix(const std::string& s, const std::string& of) {
    if (s.size() > of.size()) return false;
    return std::equal(s.begin(), s.end(), of.begin());
}


//obsluga komend debuggera
void debugger::handle_command(const std::string& line) {
    auto args = split(line,' ');
    auto command = args[0];

    if (is_prefix(command, "cont")) {
        continue_execution();
    } else if (is_prefix(command, "break")) {
        if (args[1][0] == '0' && args[1][1] == 'x') {
            std::string addr{args[1], 2};
            set_breakpoint_at_address(std::stol(addr, 0, 16));
        } else if (args[1].find(':') != std::string::npos) {
            auto file_and_line = split(args[1], ':');
            set_breakpoint_at_source_line(file_and_line[0], std::stoi(file_and_line[1]));
        } else {
            set_breakpoint_at_function(args[1]);
        }
    } else if (is_prefix(command, "step")) {
        step_in();
    } else if (is_prefix(command, "next")) {
        step_over();
    } else if (is_prefix(command, "stepOut")) {
        step_out();
    } else if (is_prefix(command, "finish")) {
        exit(0);
    } else if (is_prefix(command, "register")) {
        if (is_prefix(args[1], "dump")) {
            dump_registers();
        } else if (is_prefix(args[1], "read")) {
            std::cout << get_register_value(m_pid, get_register_from_name(args[2])) << std::endl;
        } else if (is_prefix(args[1], "write")) {
            std::string val{args[3], 2}; //assume 0xVAL
            set_register_value(m_pid, get_register_from_name(args[2]), std::stol(val, 0, 16));
        }
    }else if (is_prefix(command, "memory")) {
        std::string addr{args[2], 2}; //assume 0xADDRESS

        if (is_prefix(args[1], "read")) {
            std::cout << std::hex << read_memory(std::stol(addr, 0, 16)) << std::endl;
        }
        if (is_prefix(args[1], "write")) {
            std::string val{args[3], 2}; //assume 0xVAL
            write_memory(std::stol(addr, 0, 16), std::stol(val, 0, 16));
        }
    } else if (is_prefix(command, "variables")) {
        read_variables();
    } else if (is_prefix(command, "backtrace")) {
        print_backtrace();
    } else if (is_prefix(command, "symbol")) {
        auto syms = lookup_symbol(args[1]);
        for (auto &&s : syms) {
            std::cout << s.name << ' ' << to_string(s.type) << " 0x" << std::hex << s.addr << std::endl;
        }
    } else if (is_prefix(command, "stepi")) {
        single_step_instruction_with_breakpoint_check();
        auto line_entry = get_line_entry_from_pc(get_pc());
        print_source(line_entry->file->path, line_entry->line);
    } else {
        std::cerr << "Unknown command\n";
    }
}

bool is_suffix(const std::string &s, const std::string &of) {
    if (s.size() > of.size()) return false;
    auto diff = of.size() - s.size();
    return std::equal(s.begin(), s.end(), of.begin() + diff);
}

void debugger::set_breakpoint_at_function(const std::string &name) {
    for (const auto &cu : m_dwarf.compilation_units()) {
        for (const auto &die : cu.root()) {
            if (die.has(dwarf::DW_AT::name) && at_name(die) == name) {
                auto low_pc = at_low_pc(die);
                auto entry = get_line_entry_from_pc(low_pc);
                ++entry; //skip prologue
                set_breakpoint_at_address(entry->address);
            }
        }
    }
}

void debugger::set_breakpoint_at_source_line(const std::string &file, unsigned line) {
    for (const auto &cu : m_dwarf.compilation_units()) {
        if (is_suffix(file, at_name(cu.root()))) {
            const auto &lt = cu.get_line_table();

            for (const auto &entry : lt) {
                if (entry.is_stmt && entry.line == line) {
                    set_breakpoint_at_address(entry.address);
                    return;
                }
            }
        }
    }
}

void debugger::set_breakpoint_at_address(std::intptr_t addr) {
    std::cout << "Set breakpoint at address 0x" << std::hex << addr << std::endl;
    breakpoint bp{m_pid, addr};
    bp.enable();
    m_breakpoints[addr] = bp;
}

//przechwytywanie komend debuggera
void debugger::run() {
    wait_for_signal();

    char *line = nullptr;
    while ((line = linenoise("minidbg> ")) != nullptr) {
        handle_command(line);
        linenoiseHistoryAdd(line);
        linenoiseFree(line);
    }
}

void execute_debugee (const std::string& prog_name) {
    if (ptrace(PTRACE_TRACEME, 0, 0, 0) < 0) {                //ptrace_traceme znaczy, ze proces pozwala obserwowac sie swojemu rodzicowi
        std::cerr << "Error in ptrace\n";
        return;
    }
    execl(prog_name.c_str(), prog_name.c_str(), nullptr);  //exec + parametry wykonania (program, nazwa, lista zakonczona nullpoinerem)
}


//wlaczanie debuggowanego programu
int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Program name not specified";
        return -1;
    }

    auto prog = argv[1];

    auto pid = fork();
    if (pid == 0) {
        //jestesmy w procesie dziecku
        execute_debugee(prog);

    }
    else if (pid >= 1)  {
        //jestesmy w procesie rodzicu
        debugger dbg{prog, pid};
        dbg.run();
    }
}
