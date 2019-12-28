package org.cvut.navi.repository;

import org.cvut.navi.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipantRepository extends JpaRepository<Participant,Long> {
	
	Participant findByUsername(String username);

}
