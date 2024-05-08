import * as React from 'react';
import Box from '@mui/material/Box';
import { TextField } from '@mui/material';


export default function PostText({ setText, text, placeholder, clickEnter }) {

  return (
    <Box
      component="form"
      sx={{

        display: 'flex',
        flex: 1,
        '& .MuiTextField-root': {
          m: 0,
          width: '100%',
        },
      }}
      noValidate
      autoComplete="off"
    >

      <TextField

        id="outlined-multiline-flexible"
        label={placeholder}
        value={text}
        onChange={(event) =>
          setText(event.target.value)}
        onKeyDown={(e) => clickEnter(e)}
        multiline
        size="small"
        maxRows={3}
      />
    </Box>
  );
}
