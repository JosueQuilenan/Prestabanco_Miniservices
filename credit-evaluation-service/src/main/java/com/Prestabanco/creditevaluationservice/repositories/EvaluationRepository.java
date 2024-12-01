package com.Prestabanco.creditevaluationservice.repositories;

import com.Prestabanco.creditevaluationservice.entities.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
}
