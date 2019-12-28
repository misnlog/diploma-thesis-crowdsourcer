package org.cvut.navi.repository;

import org.cvut.navi.model.IndividualStatistic;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IndividualStatsRepository extends JpaRepository<IndividualStatistic, Long> {

	IndividualStatistic findByUsername(String username);

}
