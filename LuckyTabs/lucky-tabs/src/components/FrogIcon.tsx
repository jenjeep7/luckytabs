import { SvgIcon, SvgIconProps } from '@mui/material';
import React from 'react';

export const FrogIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      {/* Head + body */}
      <path
        d="M7 5.5C7 4.1 8.1 3 9.5 3c.9 0 1.7.4 2.3 1h.4c.6-.6 1.4-1 2.3-1C15.9 3 17 4.1 17 5.5c0 .2 0 .4-.1.6 1.6.5 2.6 1.9 2.6 3.4V14c0 2.2-1.8 4-4 4H8.5c-2.2 0-4-1.8-4-4V9.5c0-1.5 1-2.9 2.6-3.4C7 5.9 7 5.7 7 5.5z"
        fill="currentColor"
      />

      {/* Eye bulges */}
      <circle cx="9" cy="5.1" r="1.2" fill="currentColor" />
      <circle cx="15" cy="5.1" r="1.2" fill="currentColor" />

      {/* Pupils (slightly transparent to read as highlights) */}
      <circle cx="9" cy="5.1" r="0.45" fill="currentColor" fillOpacity="0.2" />
      <circle cx="15" cy="5.1" r="0.45" fill="currentColor" fillOpacity="0.2" />

      {/* Nostrils */}
      <circle cx="10.7" cy="8.2" r="0.25" fill="currentColor" fillOpacity="0.6" />
      <circle cx="13.3" cy="8.2" r="0.25" fill="currentColor" fillOpacity="0.6" />

      {/* Mouth */}
      <path
        d="M8.6 10.7c.7.8 1.9 1.3 3.4 1.3s2.7-.5 3.4-1.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
      />

      {/* Front toes (left) */}
      <path
        d="M7 14.8c-.7.1-1.2.5-1.5 1.1l-.6.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
      {/* Front toes (right) */}
      <path
        d="M15.5 14.8c.7.1 1.2.5 1.5 1.1l.6.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
      />

      {/* Hind feet suggestion */}
      <path
        d="M9 16.8l-1.2 1.4M13 16.8l1.2 1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
};
