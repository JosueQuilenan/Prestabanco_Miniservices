package com.Prestabanco.credifollowupservice.respositories;

import com.Prestabanco.credifollowupservice.entities.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {
}
