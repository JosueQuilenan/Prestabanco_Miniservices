package com.Prestabanco.loantypeservice.services;

import com.Prestabanco.loantypeservice.entities.LoanType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.math.MathContext;

@Service
public class CalculatorService {

    // Monthly Payment Calculator
    public BigDecimal calculateMonthlyPayment(double requestedAmount, int requestedMonths, double interestRate) {

        BigDecimal averageInterestRate = BigDecimal.valueOf(interestRate);

        // Calculamos la tasa de interés mensual
        BigDecimal monthlyInterestRate = averageInterestRate.divide(BigDecimal.valueOf(12), MathContext.DECIMAL64);

        // Cálculo de (1 + monthlyInterestRate)^n
        BigDecimal onePlusRate = BigDecimal.ONE.add(monthlyInterestRate);
        BigDecimal pow = onePlusRate.pow(requestedMonths);

        // Evitamos cálculos repetidos del denominador
        BigDecimal denominator = pow.subtract(BigDecimal.ONE);

        // Calculamos directamente el pago mensual
        return BigDecimal.valueOf(requestedAmount)
                .multiply(monthlyInterestRate)
                .multiply(pow)
                .divide(denominator, 2, RoundingMode.HALF_UP);
    }

    // Total Costs Calculator
    public BigDecimal calculateTotalLoanCost(int requestedAmount, int requestedMonths, double interestRate) {
        // Calcular el pago mensual una sola vez
        BigDecimal monthlyPayment = calculateMonthlyPayment(requestedAmount, requestedMonths, interestRate);

        // Constantes de seguros
        BigDecimal monthlyFireInsurance = BigDecimal.valueOf(20000);
        BigDecimal monthlyDegravamenInsure = BigDecimal.valueOf(requestedAmount).multiply(BigDecimal.valueOf(0.0003));

        // Comisión administrativa
        BigDecimal administrationFee = BigDecimal.valueOf(requestedAmount).multiply(BigDecimal.valueOf(0.01));

        // Cálculo del costo mensual total
        BigDecimal totalMonthlyCost = monthlyPayment.add(monthlyFireInsurance).add(monthlyDegravamenInsure);

        // Cálculo del costo total considerando los meses solicitados
        BigDecimal totalCost = totalMonthlyCost.multiply(BigDecimal.valueOf(requestedMonths)).add(administrationFee);

        // Redondeamos el resultado final a 2 decimales
        return totalCost.setScale(2, RoundingMode.HALF_UP);
    }
}
