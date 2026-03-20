'use client';

import { useMemo, useState } from 'react';

export default function Home() {
  const [rent, setRent] = useState('75');
  const [price, setPrice] = useState('500000');
  const [rate, setRate] = useState('3');
  const [years, setYears] = useState('10');
  const [holdYears, setHoldYears] = useState('10');
  const [loanRatio, setLoanRatio] = useState('70');
  const [growth, setGrowth] = useState('3');
  const [taxRate, setTaxRate] = useState('1.1');

  const [rentGrowth, setRentGrowth] = useState('2');
  const [annualHoldingTax, setAnnualHoldingTax] = useState('150');
  const [annualMaintenance, setAnnualMaintenance] = useState('100');
  const [sellFeeRate, setSellFeeRate] = useState('0.5');

  const rentNum = Number(rent);
  const priceNum = Number(price);
  const rateNum = Number(rate);
  const yearsNum = Number(years);
  const holdYearsNum = Number(holdYears);
  const loanRatioNum = Number(loanRatio);
  const growthNum = Number(growth);
  const taxRateNum = Number(taxRate);
  const rentGrowthNum = Number(rentGrowth);
  const annualHoldingTaxNum = Number(annualHoldingTax);
  const annualMaintenanceNum = Number(annualMaintenance);
  const sellFeeRateNum = Number(sellFeeRate);

  const calc = useMemo(() => {
    if (
      !rentNum ||
      !priceNum ||
      !yearsNum ||
      !holdYearsNum ||
      rate === '' ||
      loanRatio === '' ||
      growth === '' ||
      taxRate === '' ||
      rentGrowth === '' ||
      annualHoldingTax === '' ||
      annualMaintenance === '' ||
      sellFeeRate === ''
    ) {
      return null;
    }

    const loanAmount = priceNum * (loanRatioNum / 100);
    const monthlyRate = rateNum / 100 / 12;
    const totalMonths = yearsNum * 12;

    if (totalMonths === 0) return null;

    let monthlyPayment = 0;

    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / totalMonths;
    } else {
      monthlyPayment =
        loanAmount *
        ((monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1));
    }

    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - loanAmount;

    let rentTotal = 0;
    for (let year = 1; year <= holdYearsNum; year++) {
      const yearlyRent =
        rentNum * 12 * Math.pow(1 + rentGrowthNum / 100, year - 1);
      rentTotal += yearlyRent;
    }

    const acquisitionTax = priceNum * (taxRateNum / 100);
    const futurePrice = priceNum * Math.pow(1 + growthNum / 100, holdYearsNum);
    const capitalGain = futurePrice - priceNum;

    const totalHoldingTax = annualHoldingTaxNum * holdYearsNum;
    const totalMaintenance = annualMaintenanceNum * holdYearsNum;
    const sellingFee = futurePrice * (sellFeeRateNum / 100);

    const buyTotalCost =
      totalInterest +
      acquisitionTax +
      totalHoldingTax +
      totalMaintenance +
      sellingFee;

    const buyNetCost = buyTotalCost - capitalGain;
    const buyNetProfit = capitalGain - buyTotalCost;

    const diff = Math.abs(rentTotal - buyNetCost);

    return {
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      rentTotal,
      acquisitionTax,
      futurePrice,
      capitalGain,
      totalHoldingTax,
      totalMaintenance,
      sellingFee,
      buyTotalCost,
      buyNetCost,
      buyNetProfit,
      diff,
    };
  }, [
    rentNum,
    priceNum,
    rateNum,
    yearsNum,
    holdYearsNum,
    loanRatioNum,
    growthNum,
    taxRateNum,
    rentGrowthNum,
    annualHoldingTaxNum,
    annualMaintenanceNum,
    sellFeeRateNum,
    rate,
    loanRatio,
    growth,
    taxRate,
    rentGrowth,
    annualHoldingTax,
    annualMaintenance,
    sellFeeRate,
  ]);

  const resultText = useMemo(() => {
    if (!calc) return '값을 모두 입력해줘';

    return calc.rentTotal > calc.buyNetCost
      ? `👉 현재 가정(금리 ${rateNum.toFixed(1)}%, 집값 상승률 ${growthNum.toFixed(
          1
        )}%, 월세 인상률 ${rentGrowthNum.toFixed(1)}%) 기준으로는 집 사는게 더 유리`
      : `👉 현재 가정(금리 ${rateNum.toFixed(1)}%, 집값 상승률 ${growthNum.toFixed(
          1
        )}%, 월세 인상률 ${rentGrowthNum.toFixed(1)}%) 기준으로는 월세가 더 유리`;
  }, [calc, rateNum, growthNum, rentGrowthNum]);

  const warningText = useMemo(() => {
    if (!calc) return '';

    if (growthNum < rateNum) {
      return '※ 집값 상승률이 대출 금리보다 낮으면 매수가 불리해질 수 있어';
    }
    if (loanRatioNum >= 80) {
      return '※ 대출 비율이 높아지면 금리 변동 리스크가 커질 수 있어';
    }
    if (rentGrowthNum >= 5) {
      return '※ 월세 인상률 가정이 높아서 월세 비용이 빠르게 커질 수 있어';
    }
    return '※ 실제 세금, 대출 조건, 공실/수리, 개인 상황에 따라 결과는 달라질 수 있어';
  }, [calc, growthNum, rateNum, loanRatioNum, rentGrowthNum]);

  const graphMax = useMemo(() => {
    if (!calc) return 1;
    return Math.max(
      calc.rentTotal,
      calc.buyTotalCost,
      calc.capitalGain,
      Math.abs(calc.buyNetProfit),
      1
    );
  }, [calc]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f6f8',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
          월세 vs 매수 계산기
        </h1>
        <p style={{ color: '#666', marginBottom: '24px', fontSize: '17px' }}>
          현실 옵션까지 반영해서 월세와 매수를 비교해봐
        </p>

        <InputBox label="현재 월세 (만원)" value={rent} setValue={setRent} />
        <InputBox label="집값 (만원)" value={price} setValue={setPrice} />

        <SliderBox
          label="대출 금리 (%)"
          value={rate}
          setValue={setRate}
          min={0}
          max={10}
          step={0.1}
        />

        <InputBox label="대출 기간 (년)" value={years} setValue={setYears} />
        <InputBox label="비교 기간 (년)" value={holdYears} setValue={setHoldYears} />

        <SliderBox
          label="대출 비율 (%)"
          value={loanRatio}
          setValue={setLoanRatio}
          min={0}
          max={100}
          step={1}
        />

        <SliderBox
          label="집값 상승률 (%)"
          value={growth}
          setValue={setGrowth}
          min={-5}
          max={10}
          step={0.1}
        />

        <SliderBox
          label="취득세율 (%)"
          value={taxRate}
          setValue={setTaxRate}
          min={0}
          max={5}
          step={0.1}
        />

        <SliderBox
          label="월세 인상률 (%)"
          value={rentGrowth}
          setValue={setRentGrowth}
          min={0}
          max={10}
          step={0.1}
        />

        <InputBox
          label="연간 보유세/재산세 (만원)"
          value={annualHoldingTax}
          setValue={setAnnualHoldingTax}
        />

        <InputBox
          label="연간 유지비 (만원)"
          value={annualMaintenance}
          setValue={setAnnualMaintenance}
        />

        <SliderBox
          label="매도 수수료율 (%)"
          value={sellFeeRate}
          setValue={setSellFeeRate}
          min={0}
          max={3}
          step={0.1}
        />

        <div
          style={{
            marginTop: '8px',
            marginBottom: '18px',
            padding: '14px 16px',
            backgroundColor: '#3182f6',
            color: 'white',
            borderRadius: '14px',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          계산 결과
        </div>

        {calc ? (
          <>
            <div
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: '16px',
                padding: '18px',
              }}
            >
              <p style={textStyle}>
                월 대출 상환액: {formatMoney(calc.monthlyPayment)}만원
              </p>
              <p style={textStyle}>
                총 대출 상환액: {formatMoney(calc.totalPayment)}만원
              </p>
              <p style={textStyle}>
                총 대출 이자: {formatMoney(calc.totalInterest)}만원
              </p>
              <p style={textStyle}>
                {holdYearsNum}년 월세 총액(인상 반영): {formatMoney(calc.rentTotal)}만원
              </p>
              <p style={textStyle}>
                취득세: {formatMoney(calc.acquisitionTax)}만원
              </p>
              <p style={textStyle}>
                보유세/재산세 누적: {formatMoney(calc.totalHoldingTax)}만원
              </p>
              <p style={textStyle}>
                유지비 누적: {formatMoney(calc.totalMaintenance)}만원
              </p>
              <p style={textStyle}>
                매도 수수료: {formatMoney(calc.sellingFee)}만원
              </p>
              <p style={textStyle}>
                {holdYearsNum}년 후 예상 집값: {formatMoney(calc.futurePrice)}만원
              </p>
              <p style={textStyle}>
                집값 상승 이익: {formatMoney(calc.capitalGain)}만원
              </p>
              <p style={textStyle}>
                월세 vs 매수 차이: {formatMoney(calc.diff)}만원
              </p>
              <p style={textStyle}>
                {calc.buyNetProfit >= 0
                  ? `매수 예상 이익: ${formatMoney(calc.buyNetProfit)}만원`
                  : `매수 순부담: ${formatMoney(Math.abs(calc.buyNetProfit))}만원`}
              </p>

              <h2 style={{ margin: '14px 0 0 0', fontSize: '24px', lineHeight: 1.4 }}>
                {resultText}
              </h2>

              {warningText && (
                <p
                  style={{
                    marginTop: '12px',
                    color: '#d97706',
                    fontSize: '14px',
                    lineHeight: 1.5,
                  }}
                >
                  {warningText}
                </p>
              )}
            </div>

            <div
              style={{
                marginTop: '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '16px',
                padding: '18px',
              }}
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>
                비용 비교 그래프
              </h3>

              <BarRow
                label={`${holdYearsNum}년 월세 총액`}
                value={calc.rentTotal}
                maxValue={graphMax}
              />

              <BarRow
                label="매수 총 비용 (이자+세금+유지비+매도수수료)"
                value={calc.buyTotalCost}
                maxValue={graphMax}
              />

              <BarRow
                label="집값 상승 이익"
                value={calc.capitalGain}
                maxValue={graphMax}
              />

              <BarRow
                label={calc.buyNetProfit >= 0 ? '매수 예상 이익' : '매수 순부담'}
                value={Math.abs(calc.buyNetProfit)}
                maxValue={graphMax}
              />
            </div>
          </>
        ) : (
          <div
            style={{
              backgroundColor: '#f9fafb',
              borderRadius: '16px',
              padding: '18px',
              color: '#666',
              fontSize: '16px',
            }}
          >
            값을 모두 입력해줘
          </div>
        )}
      </div>
    </div>
  );
}

function InputBox({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

function SliderBox({
  label,
  value,
  setValue,
  min,
  max,
  step,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={labelStyle}>
        {label} <span style={{ color: '#3182f6' }}>{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ width: '100%' }}
      />
    </div>
  );
}

function BarRow({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: number;
  maxValue: number;
}) {
  const safeValue = Math.max(value, 0);
  const widthPercent = (safeValue / maxValue) * 100;

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '6px',
          fontSize: '15px',
          fontWeight: 600,
        }}
      >
        <span>{label}</span>
        <span>{formatMoney(safeValue)}만원</span>
      </div>
      <div
        style={{
          width: '100%',
          height: '14px',
          backgroundColor: '#e5e7eb',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${widthPercent}%`,
            height: '100%',
            backgroundColor: '#3182f6',
            borderRadius: '999px',
          }}
        />
      </div>
    </div>
  );
}

function formatMoney(value: number) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 700,
  fontSize: '17px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  border: '1px solid #ddd',
  borderRadius: '14px',
  fontSize: '18px',
  boxSizing: 'border-box',
};

const textStyle: React.CSSProperties = {
  margin: '0 0 10px 0',
  fontSize: '18px',
};