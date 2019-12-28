package org.cvut.navi.model;

import java.math.BigDecimal;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Transient;

@Entity
public class IndividualStatistic extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;
	private String username;
	private Long cornerCount;
	private Long crosswalkCount;
	private Long sidewalkCount;
	private Long obstacleCount;
	
	private BigDecimal accuracy;
	
	private BigDecimal sidewalkAccuracy;
	private BigDecimal obstacleAccuracy;
	private BigDecimal crosswalkAccuracy;
	private BigDecimal cornerAccuracy;

	public BigDecimal getAccuracy() {
		return accuracy;
	}

	public void setAccuracy(BigDecimal accuracy) {
		this.accuracy = accuracy;
	}

	@Transient
	private Long all;

	public Long getAll() {
		return cornerCount + crosswalkCount + sidewalkCount + obstacleCount;
	}

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

	public Long getCornerCount() {
		return cornerCount;
	}

	public void setCornerCount(Long cornerCount) {
		this.cornerCount = cornerCount;
	}

	public Long getCrosswalkCount() {
		return crosswalkCount;
	}

	public void setCrosswalkCount(Long crosswalkCount) {
		this.crosswalkCount = crosswalkCount;
	}

	public Long getSidewalkCount() {
		return sidewalkCount;
	}

	public void setSidewalkCount(Long sidewalkCount) {
		this.sidewalkCount = sidewalkCount;
	}

	public Long getObstacleCount() {
		return obstacleCount;
	}

	public void setObstacleCount(Long obstacle) {
		this.obstacleCount = obstacle;
	}

	public BigDecimal getSidewalkAccuracy() {
		return sidewalkAccuracy;
	}

	public void setSidewalkAccuracy(BigDecimal sidewalkAccuracy) {
		this.sidewalkAccuracy = sidewalkAccuracy;
	}

	public BigDecimal getObstacleAccuracy() {
		return obstacleAccuracy;
	}

	public void setObstacleAccuracy(BigDecimal obstacleAccuracy) {
		this.obstacleAccuracy = obstacleAccuracy;
	}

	public BigDecimal getCrosswalkAccuracy() {
		return crosswalkAccuracy;
	}

	public void setCrosswalkAccuracy(BigDecimal crosswalkAccuracy) {
		this.crosswalkAccuracy = crosswalkAccuracy;
	}

	public BigDecimal getCornerAccuracy() {
		return cornerAccuracy;
	}

	public void setCornerAccuracy(BigDecimal cornerAccuracy) {
		this.cornerAccuracy = cornerAccuracy;
	}

	public void setAll(Long all) {
		this.all = all;
	}

}
