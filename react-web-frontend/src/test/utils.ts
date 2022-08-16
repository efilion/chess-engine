import {Square} from 'chess.js';
import { act } from 'react-dom/test-utils';

export async function flushPromises() {
  await act(async () => {
    let p = new Promise((resolve) => setTimeout(resolve, 0))
    jest.runOnlyPendingTimers()
    await p
  })
}

export async function until(callback: (() => Promise<any>)) {
  let c = callback();
  jest.runOnlyPendingTimers();
  await c;
}

export const getSquare = (square:Square) => {
    return document.querySelector(`[data-square=${square}]`);
}
export const getPieceAtSquare = (square:Square) => {
    return document.querySelector(`[data-square=${square}] [draggable]`);
}