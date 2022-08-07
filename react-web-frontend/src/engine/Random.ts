import Axios from 'axios';
import { ShortMove, Square } from 'chess.js';

export async function getRandomMove(fen: string): Promise<ShortMove> {
  return Axios.get<`${Square}${Square}`>(
    `${(process.env.REACT_APP_TLS === "true")?'https':'http'}://${process.env.REACT_APP_ENGINE_SERVICE}/random/uci/${encodeURI(fen)}`
    )
    .then((res) => {
      return {
        from: res.data.slice(0,2) as Square,
        to: res.data.slice(2,4) as Square,
        promotion: "q"
      };
    })
}