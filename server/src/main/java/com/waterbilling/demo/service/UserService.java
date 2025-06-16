package com.waterbilling.demo.service;

import com.waterbilling.demo.dto.request.EmployeeCreateRequestDTO;
import com.waterbilling.demo.dto.request.EmployeeUpdateDTO;
import com.waterbilling.demo.dto.request.OwnerCreateRequestDTO;
import com.waterbilling.demo.dto.request.OwnerUpdateDTO;
import com.waterbilling.demo.dto.response.EmployeeDTO;
import com.waterbilling.demo.dto.response.OwnerDTO;
import com.waterbilling.demo.exception.DuplicateResourceException;
import com.waterbilling.demo.exception.InvalidRequestException;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.model.Account;
import com.waterbilling.demo.model.Employee;
import com.waterbilling.demo.model.Owner;
import com.waterbilling.demo.model.Role;
import com.waterbilling.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;

// --- Owner Management Service ---
@Service
public class UserService { // Handles both Owner and Employee related user management

    @Autowired
    private OwnerRepository ownerRepository;
    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private ContractRepository contractRepository;


    @PreAuthorize("hasRole('admin')")
    @Transactional
    public OwnerDTO createOwner(OwnerCreateRequestDTO request, Long createdByEmployeeId) {
        
        if (ownerRepository.existsByIdentityNumber(request.getIdentityNumber())) {
            throw new DuplicateResourceException("CCCD đã tồn tại.");
        }
        if (ownerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email đã tồn tại");
        }
        if (ownerRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new DuplicateResourceException("Số điện thoại đã tồn tại");
        }
        
        Owner owner = new Owner();
        owner.setFullName(request.getFullName());
        owner.setIdentityNumber(request.getIdentityNumber());
        owner.setEmail(request.getEmail());
        owner.setPhoneNumber(request.getPhoneNumber());

        Employee createdBy = employeeRepository.findById(createdByEmployeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Creator Employee not found."));
        owner.setCreatedBy(createdBy);

        ownerRepository.save(owner);

        return convertToOwnerDTO(owner);
    }

    @PreAuthorize("hasRole('admin')")
    public Page<OwnerDTO> getOwners(String searchTerm, Optional<Boolean> isActive, Pageable pageable) {
        Page<Owner> ownersPage;
        if (searchTerm != null && !searchTerm.trim().isEmpty() && isActive.isPresent()) {
            ownersPage = ownerRepository.findByFullNameContainingIgnoreCaseAndIsActive(searchTerm, isActive.get(), pageable);
        } else if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            ownersPage = ownerRepository.findByFullNameContainingIgnoreCase(searchTerm, pageable);
        } else if (isActive.isPresent()) {
            ownersPage = ownerRepository.findByIsActive(isActive.get(), pageable);
        } else {
            ownersPage = ownerRepository.findAll(pageable);
        }
        return ownersPage.map(this::convertToOwnerDTO);
    }

    @PreAuthorize("hasRole('admin')")
    public OwnerDTO getOwnerById(Long ownerId) {
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with ID: " + ownerId));
        return convertToOwnerDTO(owner);
    }

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public OwnerDTO updateOwner(Long ownerId, OwnerUpdateDTO request) {
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with ID: " + ownerId));

        if (request.getEmail() != null && !request.getEmail().equals(owner.getEmail()) && ownerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email đã tồn tại.");
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(owner.getPhoneNumber()) && ownerRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new DuplicateResourceException("Số điện thoại đã tồn tại");
        }

        owner.setFullName(request.getFullName());
        owner.setEmail(request.getEmail());
        owner.setPhoneNumber(request.getPhoneNumber());

        if (request.getIsActive() != owner.getActive() && owner.getAccountId() != null) {
            owner.setActive(request.getIsActive());
            Account account = accountRepository.findById(owner.getAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found for owner"));
            account.setIsActive(request.getIsActive());
            accountRepository.save(account);
        }

        ownerRepository.save(owner);
        return convertToOwnerDTO(owner);
    }

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public void deleteOwner(Long ownerId) {
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with ID: " + ownerId));

        boolean hasAnyContracts = contractRepository.existsByOwner_OwnerId(ownerId);
        if (hasAnyContracts) {
            throw new InvalidRequestException("Không thể xóa thông tin khách hàng đã có hợp đồng.");
        }


        ownerRepository.delete(owner);
        if (owner.getAccountId() != null) {
            accountRepository.deleteById(owner.getAccountId());
        }
    }
    @PreAuthorize("hasRole('admin')")
    @Transactional
    public void updateStatusOwner(Long ownerId) {
        Owner owner = ownerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ sỡ hữu"));
        if(owner.getAccountId() == null) {
            throw new InvalidRequestException("Chủ sỡ hữu chưa có tài khoản nên không thể cập nhật trạng thái được.");
        }
        Account account = accountRepository.findById(owner.getAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với ID" + owner.getAccountId()));

        owner.setActive(!owner.getActive());
        ownerRepository.save(owner);
        account.setIsActive(!account.getIsActive());
        accountRepository.save(account);
    }
    // --- Employee Management ---

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public EmployeeDTO createEmployee(EmployeeCreateRequestDTO request) {
        if (accountRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new DuplicateResourceException("Tên đăng nhập đã tồn tại.");
        }
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email đã tồn tại.");
        }
        if (employeeRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new DuplicateResourceException("Số điện thoại đã tồn tại.");
        }

        Role employeeRole = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role  not found. System misconfigured."));
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setRole(employeeRole);
        account.setIsActive(true);
        accountRepository.save(account);

        Employee employee = new Employee();
        employee.setFullName(request.getFullName());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setEmail(request.getEmail());
        employee.setAccount(account);
        employee.setIsActive(true);
        employeeRepository.save(employee);

        return convertToEmployeeDTO(employee);
    }

    public Page<EmployeeDTO> getEmployees(String searchTerm, Optional<Boolean> isActive, Pageable pageable) {
        Page<Employee> employeesPage;
        if (searchTerm != null && !searchTerm.trim().isEmpty() && isActive.isPresent()) {
            employeesPage = employeeRepository.findByFullNameContainingIgnoreCaseAndIsActive(searchTerm, isActive.get(), pageable);
        } else if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            employeesPage = employeeRepository.findByFullNameContainingIgnoreCase(searchTerm, pageable);
        } else if (isActive.isPresent()) {
            employeesPage = employeeRepository.findByIsActive(isActive.get(), pageable);
        } else {
            employeesPage = employeeRepository.findAll(pageable);
        }

        return employeesPage.map(this::convertToEmployeeDTO);
    }

    @PreAuthorize("hasRole('admin')")
    public EmployeeDTO getEmployeeById(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));
        return convertToEmployeeDTO(employee);
    }

    @PreAuthorize("hasRole('admin')")
    @Transactional
    public EmployeeDTO updateEmployee(Long employeeId, EmployeeUpdateDTO request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        if (request.getEmail() != null && !request.getEmail().equals(employee.getEmail()) && employeeRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email đã tồn tại.");
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(employee.getPhoneNumber()) && employeeRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new DuplicateResourceException("Số điện thoại đã tồn tại.");
        }

        employee.setFullName(request.getFullName());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setEmail(request.getEmail());

        if (request.getIsActive() != null) {
            employee.setIsActive(request.getIsActive());
            if (employee.getAccount() != null) {
                employee.getAccount().setIsActive(request.getIsActive());
            }
        }
        if (!Objects.equals(request.getRoleId(), employee.getAccount().getRole().getRoleId())) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found with ID: " + request.getRoleId()));
            employee.getAccount().setRole(role);
        }
        if(request.getNewPassword() != null) {
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            employee.getAccount().setPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        accountRepository.save(employee.getAccount());
        employeeRepository.save(employee);
        return convertToEmployeeDTO(employee);
    }
    @PreAuthorize("hasRole('admin')")
    @Transactional
    public void updateStatusEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chủ sỡ hữu"));

        Account account = employee.getAccount();
        employee.setIsActive(!employee.getIsActive());
        employeeRepository.save(employee);
        account.setIsActive(!account.getIsActive());
        accountRepository.save(account);
    }

    private OwnerDTO convertToOwnerDTO(Owner owner) {

        OwnerDTO dto = new OwnerDTO();
        dto.setOwnerId(owner.getOwnerId());

        dto.setFullName(owner.getFullName());
        dto.setIdentityNumber(owner.getIdentityNumber());
        dto.setEmail(owner.getEmail());
        dto.setPhoneNumber(owner.getPhoneNumber());
        dto.setIsActive(owner.getActive());
        dto.setCreatedAt(owner.getCreatedAt());
        if (owner.getAccountId() != null ){
            Account account = accountRepository.findById(owner.getAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found for owner"));
            dto.setUsername( account.getUsername() );
        }
        return dto;
    }

    private EmployeeDTO convertToEmployeeDTO(Employee employee) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setEmployeeId(employee.getEmployeeId());
        dto.setUsername(employee.getAccount() != null ? employee.getAccount().getUsername() : null);
        dto.setFullName(employee.getFullName());
        dto.setPhoneNumber(employee.getPhoneNumber());
        dto.setEmail(employee.getEmail());
        dto.setIsActive(employee.getIsActive());
        dto.setCreatedAt(employee.getCreatedAt());
        dto.setRoleId(employee.getAccount().getRole().getRoleId());
        return dto;
    }
}
