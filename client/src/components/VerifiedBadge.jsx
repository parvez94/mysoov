import React from 'react';
import styled from 'styled-components';
import { MdVerified } from 'react-icons/md';

const Badge = styled(MdVerified)`
  margin-left: 4px;
  vertical-align: middle;
  flex-shrink: 0;
`;

const VerifiedBadge = ({ user, size = 16 }) => {
  if (!user) return null;

  // Admin gets red badge
  if (user.role === 'admin') {
    return <Badge size={size} color='#ff0000' title='Admin' />;
  }

  // Paid users get blue badge
  if (user.subscription?.isPaid || user.isVerified) {
    return <Badge size={size} color='#1DA1F2' title='Verified' />;
  }

  return null;
};

export default VerifiedBadge;
