package org.cvut.navi.model;

import java.io.Serializable;

public class UnmappedCount implements Serializable {

	private static final long serialVersionUID = 6569996194633807801L;

	private Integer sidewalkType;
	private Integer sidewalkQuality;
	private Integer corners;
	private Integer zebraSurfaceType;
	private Integer tactile;
	private Integer platformType;
	private Integer semaphore;
	private Integer zebraSurfaceQuality;
	private Integer zebraType;
	private Integer numberOfStripes;

	public Integer getSidewalkType() {
		return sidewalkType;
	}

	public void setSidewalkType(Integer sidewalkType) {
		this.sidewalkType = sidewalkType;
	}

	public Integer getCorners() {
		return corners;
	}

	public void setCorners(Integer corners) {
		this.corners = corners;
	}

	public Integer getZebraSurfaceType() {
		return zebraSurfaceType;
	}

	public void setZebraSurfaceType(Integer surfaceType) {
		this.zebraSurfaceType = surfaceType;
	}

	public Integer getTactile() {
		return tactile;
	}

	public void setTactile(Integer tactile) {
		this.tactile = tactile;
	}

	public Integer getPlatformType() {
		return platformType;
	}

	public void setPlatformType(Integer platformType) {
		this.platformType = platformType;
	}

	public Integer getSidewalkQuality() {
		return sidewalkQuality;
	}

	public void setSidewalkQuality(Integer sidewalkQuality) {
		this.sidewalkQuality = sidewalkQuality;
	}

	public Integer getNumberOfStripes() {
		return numberOfStripes;
	}

	public void setNumberOfStripes(Integer numberOfStripes) {
		this.numberOfStripes = numberOfStripes;
	}

	public Integer getSemaphore() {
		return semaphore;
	}

	public void setSemaphore(Integer semaphore) {
		this.semaphore = semaphore;
	}

	public Integer getZebraSurfaceQuality() {
		return zebraSurfaceQuality;
	}

	public void setZebraSurfaceQuality(Integer surfaceQuality) {
		this.zebraSurfaceQuality = surfaceQuality;
	}

	public Integer getZebraType() {
		return zebraType;
	}

	public void setZebraType(Integer zebraType) {
		this.zebraType = zebraType;
	}
}
