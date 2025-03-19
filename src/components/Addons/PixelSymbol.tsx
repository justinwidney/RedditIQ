
interface PixelSymbolProps {
    type : SupportedSymbols
    scale?  : number;
    color? : string;
}

interface Symbol {
    height: number;
    width: number;
    path: string;
}

export type SupportedSymbols = keyof typeof Symbols


import { Devvit } from "@devvit/public-api";
import Symbols from "../../data/Symbols.json"

export function PixelSymbol(props: PixelSymbolProps): JSX.Element {

    const {type, scale = 4, color = 'black'} = props


    const symbol: Symbol = Symbols[type];

    const height = symbol.height
    const width = symbol.width 

    const sh : Devvit.Blocks.SizeString = `${height * scale}px`
    const sw : Devvit.Blocks.SizeString = `${width * scale}px`



    return (
        <image
        imageHeight={sw}
        imageWidth={sh}
        height={sh}
        width= {sw}
        resizeMode="fill"
        description={type}
        url={`data:image/svg+xml,
        <svg
          width="${width}"
          height="${height}"
          viewBox="0 0 ${width} ${height}"
          xmlns="http://www.w3.org/2000/svg"
          shape-rendering="crispEdges"
        >
          <path
            d="${symbol.path}"
            fill="${color}"
            fill-rule="evenodd"
            clip-rule="evenodd"
          />
        </svg>
      `}
        />
    )


}