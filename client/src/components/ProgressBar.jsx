import React from 'react';
import styled, { keyframes, css } from 'styled-components';

// Animated stripes for indeterminate/stateful motion
const move = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 40px 0; }
`;

const Container = styled.div`
  width: 100%;
  margin: 10px 0;
`;

const Track = styled.div`
  position: relative;
  height: ${(p) => (p.size === 'sm' ? 8 : p.size === 'lg' ? 14 : 10)}px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  overflow: hidden;
`;

const Bar = styled.div`
  height: 100%;
  width: ${(p) => Math.min(100, Math.max(0, p.value))}%;
  transition: width 200ms ease;
  border-radius: inherit;
  ${(p) => {
    const uploading = p.status === 'uploading' || p.status === 'indeterminate';
    const success = p.status === 'success';
    const error = p.status === 'error';

    let color = 'linear-gradient(90deg, #6a5acd 0%, #7b68ee 50%, #9370db 100%)';
    if (success) color = 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)';
    if (error) color = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';

    return css`
      background-image: ${color},
        repeating-linear-gradient(
          45deg,
          rgba(255, 255, 255, 0.12) 0,
          rgba(255, 255, 255, 0.12) 8px,
          rgba(255, 255, 255, 0.06) 8px,
          rgba(255, 255, 255, 0.06) 16px
        );
      background-blend-mode: overlay;
      ${uploading && !success && !error
        ? css`
            background-size: 100% 100%, 40px 40px;
            animation: ${move} 0.8s linear infinite;
          `
        : css`
            background-size: 100% 100%, 40px 40px;
          `}
    `;
  }}
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-family: var(--secondary-fonts);
  font-size: ${(p) => (p.size === 'sm' ? 11 : p.size === 'lg' ? 14 : 12)}px;
  color: rgba(255, 255, 255, 0.65);
`;

const LabelLeft = styled.span``;
const LabelRight = styled.span`
  color: rgba(255, 255, 255, 0.5);
`;

/**
 * ProgressBar component
 * - value: number 0..100
 * - status: 'idle' | 'uploading' | 'success' | 'error' | 'indeterminate'
 * - label: string (left-aligned message)
 * - size: 'sm' | 'md' | 'lg'
 */
const ProgressBar = ({
  value = 0,
  status = 'idle',
  label = '',
  size = 'md',
  showPercent = true,
  className,
  ...rest
}) => {
  const ariaValueNow = Number.isFinite(value) ? Math.round(value) : undefined;
  const ariaValueText = `${ariaValueNow ?? 0}%`;

  return (
    <Container className={className} {...rest}>
      <Track
        size={size}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={ariaValueNow}
        aria-valuetext={ariaValueText}
        role='progressbar'
      >
        <Bar value={value || 0} status={status} />
      </Track>
      {(label || showPercent) && (
        <LabelRow size={size}>
          <LabelLeft>{label}</LabelLeft>
          {showPercent && <LabelRight>{Math.round(value || 0)}%</LabelRight>}
        </LabelRow>
      )}
    </Container>
  );
};

export default ProgressBar;
