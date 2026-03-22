'use client';

import { useMemo, useState } from 'react';

export default function Home() {
  const [rent, setRent] = useState('75');
  const [price, setPrice] = useState('50000');
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
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const resultSummary = useMemo(() => {
  if (!calc) {
    return {
      title: '값을 모두 입력해줘',
      tone: 'neutral' as const,
      diffText: '',
      detail: '',
    };
  }

  const rawDiff = calc.rentTotal - calc.buyNetCost;
  const absDiff = Math.abs(rawDiff);
  const threshold = 2000;

  if (absDiff < threshold) {
    return {
      title: '큰 차이 없음',
      tone: 'neutral' as const,
      diffText: `${formatKoreanMoney(absDiff)} 차이`,
      detail: `10년 기준 차이가 ${formatKoreanMoney(absDiff)} 수준이라 조건에 따라 결과가 달라질 수 있어`,
    };
  }

  if (rawDiff > 0) {
    return {
      title: '집 사는 게 더 유리',
      tone: 'buy' as const,
      diffText: `${formatKoreanMoney(absDiff)} 차이`,
      detail: `현재 조건 기준으로는 매수가 월세보다 ${formatKoreanMoney(absDiff)} 유리해`,
    };
  }

  return {
    title: '월세가 더 유리',
    tone: 'rent' as const,
    diffText: `${formatKoreanMoney(absDiff)} 차이`,
    detail: `현재 조건 기준으로는 월세가 매수보다 ${formatKoreanMoney(absDiff)} 유리해`,
  };
}, [calc]);

  const resultSubText = useMemo(() => {
    if (!calc) return '';

    return `현재 가정: 금리 ${rateNum.toFixed(1)}% · 집값 상승률 ${growthNum.toFixed(
      1
    )}% · 월세 인상률 ${rentGrowthNum.toFixed(1)}%`;
  }, [calc, rateNum, growthNum, rentGrowthNum]);

  const warningText = useMemo(() => {
    if (!calc) return '';

    if (growthNum < rateNum) {
      return '집값 상승률이 대출 금리보다 낮으면 매수가 불리해질 수 있어';
    }
    if (loanRatioNum >= 80) {
      return '대출 비율이 높아지면 금리 변동 리스크가 커질 수 있어';
    }
    if (rentGrowthNum >= 5) {
      return '월세 인상률 가정이 높아서 월세 비용이 빠르게 커질 수 있어';
    }
    return '실제 세금, 대출 조건, 수리비, 개인 상황에 따라 결과는 달라질 수 있어';
  }, [calc, growthNum, rateNum, loanRatioNum, rentGrowthNum]);

  const compareMax = useMemo(() => {
    if (!calc) return 1;
    return Math.max(calc.rentTotal, calc.buyNetCost, 1);
  }, [calc]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f6f8',
        padding: '24px 16px 40px',
      }}
    >
      <div
        style={{
          maxWidth: '860px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}
      >
        <h1 style={{ fontSize: '30px', fontWeight: 800, marginBottom: '8px' }}>
          월세 vs 매수 계산기
        </h1>
        <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px', lineHeight: 1.5 }}>
          현실 옵션까지 반영해서 월세와 매수를 비교해봐
        </p>

        <div style={sectionHeaderStyle}>기본 입력</div>

        <div style={inputGridStyle}>
          <InputBox
            label="현재 월세 (만원)"
            value={rent}
            setValue={setRent}
            placeholder="예: 75"
            hint="75 입력 = 월세 75만원"
          />
          <InputBox
            label="집값 (만원)"
            value={price}
            setValue={setPrice}
            placeholder="예: 50000"
            hint="5억은 50000, 10억은 100000"
          />
          <InputBox
            label="대출 기간 (년)"
            value={years}
            setValue={setYears}
            placeholder="예: 10"
          />
          <InputBox
            label="비교 기간 (년)"
            value={holdYears}
            setValue={setHoldYears}
            placeholder="예: 10"
          />
        </div>

        <div style={sliderStackStyle}>
          <SliderBox
            label="대출 금리 (%)"
            value={rate}
            setValue={setRate}
            min={0}
            max={10}
            step={0.1}
          />

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
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          style={toggleButtonStyle}
        >
          {showAdvanced ? '추가 옵션 접기' : '추가 옵션 보기'}
        </button>

        {showAdvanced && (
          <div style={{ marginTop: '16px' }}>
            <div style={sectionHeaderStyle}>추가 옵션</div>

            <div style={sliderStackStyle}>
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

              <SliderBox
                label="매도 수수료율 (%)"
                value={sellFeeRate}
                setValue={setSellFeeRate}
                min={0}
                max={3}
                step={0.1}
              />
            </div>

            <div style={inputGridStyle}>
              <InputBox
                label="연간 보유세/재산세 (만원)"
                value={annualHoldingTax}
                setValue={setAnnualHoldingTax}
                placeholder="예: 150"
              />

              <InputBox
                label="연간 유지비 (만원)"
                value={annualMaintenance}
                setValue={setAnnualMaintenance}
                placeholder="예: 100"
              />
            </div>
          </div>
        )}

        <div style={resultHeaderStyle}>계산 결과</div>

        {calc ? (
          <>
            <div
              style={{
                ...heroCardStyle,
                background:
                  resultSummary.tone === 'buy'
                    ? 'linear-gradient(135deg, #2563eb, #3b82f6)'
                    : resultSummary.tone === 'rent'
                    ? 'linear-gradient(135deg, #0f766e, #14b8a6)'
                    : 'linear-gradient(135deg, #64748b, #94a3b8)',
              }}
            >
              <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>
                현재 조건 기준 추천
              </div>
              <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, marginBottom: '8px' }}>
                {resultSummary.title}
              </div>
              <div style={{ fontSize: '15px', opacity: 0.95, lineHeight: 1.5 }}>
                {resultSubText}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.95, lineHeight: 1.5, marginTop: '8px' }}>
                {resultSummary.detail}
              </div>

              <div style={heroHighlightStyle}>
                <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>판단 요약</div>
                <div style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800 }}>
                  {resultSummary.diffText}
                </div>
              </div>
            </div>

            <div style={summaryGridStyle}>
              <SummaryCard
                title="월 대출 상환액"
                value={formatMonthlyMoney(calc.monthlyPayment)}
              />
              <SummaryCard
                title={`${holdYearsNum}년 월세 총액`}
                value={formatKoreanMoney(calc.rentTotal)}
              />
              <SummaryCard
                title={`${holdYearsNum}년 후 예상 집값`}
                value={formatKoreanMoney(calc.futurePrice)}
              />
            </div>

            <div style={twoColumnGridStyle}>
              <SectionCard title="월세로 살 경우">
                <DataRow
                  label={`${holdYearsNum}년 월세 총액`}
                  value={formatKoreanMoney(calc.rentTotal)}
                  strong
                />
                <DataRow label="월세 인상률" value={`${rentGrowthNum.toFixed(1)}%`} />
              </SectionCard>

              <SectionCard title="집을 살 경우">
                <DataRow label="대출 원금" value={formatKoreanMoney(calc.loanAmount)} />
                <DataRow label="총 대출 이자" value={formatKoreanMoney(calc.totalInterest)} />
                <DataRow label="취득세" value={formatKoreanMoney(calc.acquisitionTax)} />
                <DataRow label="보유세 누적" value={formatKoreanMoney(calc.totalHoldingTax)} />
                <DataRow label="유지비 누적" value={formatKoreanMoney(calc.totalMaintenance)} />
                <DataRow label="매도 수수료" value={formatKoreanMoney(calc.sellingFee)} />
                <DataRow
                  label="집값 상승 이익"
                  value={formatKoreanMoney(calc.capitalGain)}
                  highlight
                />
                <DataRow
                  label={calc.buyNetProfit >= 0 ? '매수 예상 이익' : '매수 순부담'}
                  value={formatKoreanMoney(Math.abs(calc.buyNetProfit))}
                  strong
                />
              </SectionCard>
            </div>

            <SectionCard title="핵심 비교">
              <CompareRow
                label={`${holdYearsNum}년 월세 총액`}
                value={calc.rentTotal}
                maxValue={compareMax}
              />
              <CompareRow
                label="매수 순비용"
                value={calc.buyNetCost}
                maxValue={compareMax}
              />
            </SectionCard>

            <div style={warningBoxStyle}>※ {warningText}</div>
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
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type="number"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        style={inputStyle}
      />
      {hint ? <p style={hintStyle}>{hint}</p> : null}
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
        {label} <span style={{ color: '#3182f6', fontWeight: 800 }}>{value}</span>
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

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        padding: '16px',
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{title}</div>
      <div
        style={{
          fontSize: 'clamp(20px, 4vw, 24px)',
          fontWeight: 800,
          lineHeight: 1.35,
          wordBreak: 'keep-all',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        borderRadius: '18px',
        padding: '18px',
      }}
    >
      <h3 style={{ margin: '0 0 14px 0', fontSize: '20px' }}>{title}</h3>
      {children}
    </div>
  );
}

function DataRow({
  label,
  value,
  highlight = false,
  strong = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '10px 0',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <span
        style={{
          color: '#6b7280',
          fontSize: strong ? '16px' : '14px',
          lineHeight: 1.45,
          wordBreak: 'keep-all',
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: highlight ? '#2563eb' : '#111827',
          fontSize: strong ? '18px' : '15px',
          fontWeight: strong ? 800 : 600,
          textAlign: 'right',
          lineHeight: 1.45,
          wordBreak: 'keep-all',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function CompareRow({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: number;
  maxValue: number;
}) {
  const safeValue = Math.max(value, 0);
  const safeMax = Math.max(maxValue, 1);
  const widthPercent = (safeValue / safeMax) * 100;

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '6px',
          fontSize: '15px',
          fontWeight: 700,
        }}
      >
        <span>{label}</span>
        <span>{formatKoreanMoney(safeValue)}</span>
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

function formatMonthlyMoney(value: number) {
  return `월 ${value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}만원`;
}

function formatKoreanMoney(value: number) {
  const abs = Math.abs(value);
  const eok = Math.floor(abs / 10000);
  const man = Math.round(abs % 10000);

  if (eok > 0 && man > 0) {
    return `${value < 0 ? '-' : ''}${eok}억 ${man.toLocaleString()}만원`;
  }

  if (eok > 0) {
    return `${value < 0 ? '-' : ''}${eok}억원`;
  }

  return `${value < 0 ? '-' : ''}${abs.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}만원`;
}

const sectionHeaderStyle: React.CSSProperties = {
  marginTop: '8px',
  marginBottom: '14px',
  fontSize: '18px',
  fontWeight: 800,
  color: '#111827',
};

const resultHeaderStyle: React.CSSProperties = {
  marginTop: '24px',
  marginBottom: '18px',
  padding: '14px 16px',
  backgroundColor: '#3182f6',
  color: 'white',
  borderRadius: '14px',
  fontSize: '18px',
  fontWeight: 'bold',
  textAlign: 'center',
};

const heroCardStyle: React.CSSProperties = {
  color: 'white',
  borderRadius: '20px',
  padding: '22px',
  marginBottom: '18px',
};

const heroHighlightStyle: React.CSSProperties = {
  marginTop: '16px',
  padding: '14px 16px',
  backgroundColor: 'rgba(255,255,255,0.16)',
  borderRadius: '14px',
  lineHeight: 1.4,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 700,
  fontSize: '16px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  border: '1px solid #ddd',
  borderRadius: '14px',
  fontSize: '17px',
  boxSizing: 'border-box',
};

const hintStyle: React.CSSProperties = {
  margin: '8px 2px 0',
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: 1.45,
};

const inputGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '14px',
  marginBottom: '18px',
};

const sliderStackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const summaryGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '12px',
  marginBottom: '18px',
};

const twoColumnGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '14px',
  marginBottom: '18px',
};

const toggleButtonStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #dbeafe',
  backgroundColor: '#eff6ff',
  color: '#2563eb',
  borderRadius: '14px',
  padding: '14px 16px',
  fontSize: '15px',
  fontWeight: 700,
  cursor: 'pointer',
};

const warningBoxStyle: React.CSSProperties = {
  marginTop: '18px',
  padding: '14px 16px',
  borderRadius: '14px',
  backgroundColor: '#fff7ed',
  color: '#c2410c',
  fontSize: '14px',
  lineHeight: 1.55,
};
