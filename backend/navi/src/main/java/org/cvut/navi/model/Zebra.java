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
public class Zebra extends Auditable {

	@Transient
	private Logger logger = LoggerFactory.getLogger(Zebra.class);
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	private Integer numberOfStripes;
	private String guidingStripe;
	private String lightSignal;
	private String audioSignal;
	private String button;
	private String surfaceType;
	private String surfaceQuality;
	private String zebraType;

	@OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JoinColumn(name = "mid_id", referencedColumnName = "id")
	private Point mid;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Integer getNumberOfStripes() {
		return numberOfStripes;
	}

	public void setNumberOfStripes(Integer numberOfStripes) {
		this.numberOfStripes = numberOfStripes;
	}

	public String getGuidingStripe() {
		return guidingStripe;
	}

	public void setGuidingStripe(String guidingStripe) {
		this.guidingStripe = guidingStripe;
	}

	public String getLightSignal() {
		return lightSignal;
	}

	public void setLightSignal(String lightSignal) {
		this.lightSignal = lightSignal;
	}

	public String getAudioSignal() {
		return audioSignal;
	}

	public void setAudioSignal(String audioSignal) {
		this.audioSignal = audioSignal;
	}

	public String getButton() {
		return button;
	}

	public void setButton(String button) {
		this.button = button;
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

	public String getZebraType() {
		return zebraType;
	}

	public void setZebraType(String zebraType) {
		this.zebraType = zebraType;
	}

	public Point getMid() {
		return mid;
	}

	public void setMid(Point mid) {
		this.mid = mid;
	}

	@Override
	public String toString() {
		return "Zebra [id=" + id + ", numberOfStripes=" + numberOfStripes + ", guidingStripe=" + guidingStripe
				+ ", lightSignal=" + lightSignal + ", audioSignal=" + audioSignal + ", button=" + button
				+ ", surfaceType=" + surfaceType + ", surfaceQuality=" + surfaceQuality + ", zebraType=" + zebraType
				+ "]";
	}

	public Boolean isMapped() {

		if (numberOfStripes != null && guidingStripe != null && lightSignal != null && audioSignal != null
				&& button != null && surfaceType != null && surfaceQuality != null && zebraType != null) {
		//	logger.info("Zebra {} is mapped completely", this.getId());

			return true;
		} else {
		//	logger.info("Zebra {} unmapped", this.getId());

			return false;
		}

	}

}
