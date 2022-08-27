import React, { useCallback, useState } from 'react';
import './App.css';
import Chessboard, { BoardProps, GameResult } from './chessboard/Chessboard';
import { fetchAkimboMove } from './engine/Akimbo';
import { AppBar, Box, Toolbar, IconButton, Typography, Container, Divider, Grid,
  Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

import TypeScript_Logo from './assets/typescript_logo.png';
import React_Logo from './assets/react_logo.png';
import Python_Logo from './assets/python_logo.png';
import Flask_Logo from './assets/flask_logo.png';

function App(props: {boardProps?: Partial<BoardProps>}) {

  const [openStartDialog, setOpenStartDialog] = useState<boolean>(false);
  type sides = ('white'|'black');
  const [choose, setChoose] = useState<(choice:sides)=>void>(() => () => {});
  const startGame = useCallback(() => {
    let playerChoice = new Promise<sides>((resolve) => {
      setChoose(() => resolve);
    });
    setOpenStartDialog(true)
    return playerChoice;
  }, [setChoose, setOpenStartDialog])
  const chooseWhite = () => {
    choose('white');
    setOpenStartDialog(false);
  }
  const chooseBlack = () => {
    choose('black');
    setOpenStartDialog(false);
  }
  
  const [openEndDialog, setOpenEndDialog] = useState<boolean>(false);
  const [endDialogText, setEndDialogText] = useState<string>("")
  const endGame = useCallback((result:GameResult) => {
    if (result === 'drawn') {
      setEndDialogText('Game is drawn.')
    }
    else if (result === 'white') {
      setEndDialogText('White won by checkmate.');
    }
    else { // result == 'black'
      setEndDialogText('Black won by checkmate.');
    }
    setOpenEndDialog(true);
  }, [])

  const boardProps = Object.assign({
    onStartGame: startGame,
    onGameOver: endGame,
    engineMove: fetchAkimboMove,
    engineDelay: 0.5
  }, props.boardProps)

  return (
    <>
    <Box position="relative" minHeight="100vh">
      <Box>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="h6" sx={{ flexGrow: 1 }}>
              Chess Engine
            </Typography>
            <IconButton aria-label='github.com/efilion/chess-engine'
              color='inherit'
              onClick={() => window.open('https://www.github.com/efilion/chess-engine')} 
            >
              <GitHubIcon fontSize='large' />
            </IconButton> 
            <IconButton aria-label='linkedin.com/in/ericlfilion'
              color='inherit'
              onClick={() => window.open('https://www.linkedin.com/in/ericlfilion/')} 
            >
              <LinkedInIcon fontSize='large' />
            </IconButton> 
          </Toolbar>
        </AppBar>
      </Box>
      <Box>
        <Container maxWidth="sm" sx={{ margin: '4vh auto' }}>
          <div className="App">
            <Chessboard {...boardProps} />
            <Dialog // Start Dialog
              open={openStartDialog}
              aria-labelledby='start-dialog-title'
            >
              <DialogTitle id='start-dialog-title'>
                {'Choose side'}
              </DialogTitle>
              <DialogActions>
                <Button onClick={chooseWhite}>
                  White
                </Button>

                <Button onClick={chooseBlack}>
                  Black
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog // End Dialog
              open={openEndDialog}
              aria-labelledby='end-dialog-title'
              aria-describedby='end-dialog-description'
            >
              <DialogTitle id='end-dialog-title'>
                {'Game Over'}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id='end-dialog-description'>
                  {endDialogText}
                </DialogContentText>
              </DialogContent>
            </Dialog>
          </div>
        </Container> 
      </Box>
      <Box>
        <Divider />
        <Container>
          <Grid maxWidth="sm" container sx={{ margin: '1em auto' }} rowSpacing={2}>
            <Grid item sm={12}>
              <Typography variant='h5'>
                Built with
              </Typography>
            </Grid>
            <Grid item sm={3}>
              <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer"><img src={TypeScript_Logo} className="Logo" alt="TypeScript" /></a>
            </Grid>
            <Grid item sm={3}>
              <a href="https://reactjs.org/" target="_blank" rel="noreferrer"><img src={React_Logo} className="Logo" alt="React" /></a>
            </Grid>
            <Grid item sm={3}>
              <a href="https://www.python.org/" target="_blank" rel="noreferrer"><img src={Python_Logo} className="Logo" alt="Python" /></a>
            </Grid>
            <Grid item sm={3}>
              <a href="https://flask.palletsprojects.com/" target="_blank" rel="noreferrer"><img src={Flask_Logo} className="Logo" alt="Flask" /></a>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
    </>
  );
}

export default App;