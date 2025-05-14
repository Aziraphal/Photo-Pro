import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

function FlipVertical(props) {
  return (
    <SvgIcon {...props}>
      <path d="M3 15h2v2h-2zm0-8h2v2h-2zm2 8h2v2H5zm0-8h2v2H5zm2 8h2v2H7zm0-8h2v2H7zm2 8h2v2H9zm0-8h2v2H9zm8 8h2v2h-2zm-8 4h2v2H9zm0-16h2v2H9zm8 12h2v2h-2zm0-8h2v2h-2zm4 4h2v2h-2zm0 4h2v2h-2zm0-8h2v2h-2zm0-4h2v2h-2z" />
    </SvgIcon>
  );
}

export default FlipVertical; 