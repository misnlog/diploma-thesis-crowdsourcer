package org.cvut.navi.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class UserAuditLog extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;
	private String username;
	private String auditString;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getAuditString() {
		return auditString;
	}

	public void setAuditString(String auditString) {
		this.auditString = auditString;
	}

	@Override
	public String toString() {
		return "UserAuditLog [id=" + id + ", username=" + username + ", auditString=" + auditString + "]";
	}

}
