import React, { useState } from 'react';
import './App.css';
import Chessboard, { BoardProps, GameResult } from './chessboard/Chessboard';
import { getRandomMove } from './engine/Random';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

function App(props: {boardProps?: Partial<BoardProps>}) {

  const [openStartDialog, setOpenStartDialog] = useState<boolean>(false);
  type sides = ('white'|'black');
  const [choose, setChoose] = useState<(choice:sides)=>void>(() => () => {});
  const startGame = () => {
    let playerChoice = new Promise<sides>((resolve) => {
      setChoose(() => resolve);
    });
    setOpenStartDialog(true)
    return playerChoice;
  }
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
  const endGame = (result:GameResult) => {
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
  }

  const boardProps = Object.assign({
    onStartGame: startGame,
    onGameOver: endGame,
    engineMove: getRandomMove
  }, props.boardProps)

  return (
    <>
      <div className="App">
        <Chessboard {...boardProps } />
      </div>
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
                { endDialogText }
              </DialogContentText>
          </DialogContent>
      </Dialog>
    </>
  );
}

export default App;
