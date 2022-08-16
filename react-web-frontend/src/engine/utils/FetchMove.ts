import Axios from 'axios';
import { ShortMove, Square } from 'chess.js';

export function getUciMove(strategy: string): (fen: string) => Promise<ShortMove> {
  return (fen: string) => Axios.get<`${Square}${Square}`>(
    `${(process.env.REACT_APP_TLS === "true")?'https':'http'}://${process.env.REACT_APP_ENGINE_SERVICE}/${strategy}/uci/${encodeURI(fen)}`
    )
    .then((res) => {
      return {
        from: res.data.slice(0,2) as Square,
        to: res.data.slice(2,4) as Square,
        promotion: "q"
      };
    })
}