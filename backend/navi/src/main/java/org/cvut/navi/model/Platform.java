package org.cvut.navi.model;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Transient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Entity
public class Platform extends Auditable {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JoinColumn(name = "gps_id", referencedColumnName = "id")
	private Point gps;

	private String surfaceType;
	private String surfaceQuality;
	private String platformType;
	private String signalStripe;
	private String warningStripe;
	@Transient
	private Logger logger = LoggerFactory.getLogger(Platform.class);

	public String getPlatformType() {
		return platformType;
	}

	public void setPlatformType(String platformType) {
		this.platformType = platformType;
	}

	public String getSignalStripe() {
		return signalStripe;
	}

	public void setSignalStripe(String signalStripe) {
		this.signalStripe = signalStripe;
	}

	public String getWarningStripe() {
		return warningStripe;
	}

	public void setWarningStripe(String warningStripe) {
		this.warningStripe = warningStripe;
	}

	public String getSurfaceType() {
		return surfaceType;
	}

	public void setSurfaceType(String surfaceType) {
		this.surfaceType = surfaceType;
	}

	public String getSurfaceQuality() {
		return surfaceQuality;
	}

	public void setSurfaceQuality(String surfaceQuality) {
		this.surfaceQuality = surfaceQuality;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Point getGps() {
		return gps;
	}

	public void setGps(Point gps) {
		this.gps = gps;
	}

	public Boolean isMapped() {

		if (surfaceType != null && surfaceQuality != null && platformType != null && signalStripe != null
				&& warningStripe != null) {
	//		logger.info("Platform {} is mapped completely", this.getId());

			return true;
		}
	//	logger.info("Platform {} is unmapped", this.getId());

		return false;
	}

	@Override
	public String toString() {
		return "Platform [id=" + id + ", gps=" + gps + ", surfaceType=" + surfaceType + ", surfaceQuality="
				+ surfaceQuality + ", platformType=" + platformType + ", signalStripe=" + signalStripe
				+ ", warningStripe=" + warningStripe + "]";
	}
}
