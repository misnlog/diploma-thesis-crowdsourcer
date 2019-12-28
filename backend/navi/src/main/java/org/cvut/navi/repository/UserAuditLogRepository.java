package org.cvut.navi.repository;

import org.cvut.navi.model.UserAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAuditLogRepository extends JpaRepository<UserAuditLog, Long> {

}
