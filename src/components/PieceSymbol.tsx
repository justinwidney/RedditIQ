import { Devvit } from '@devvit/public-api';
import Settings from '../Settings.json';
import piecesData from '../data/pieces.json';




export type SupportedPieces = keyof typeof Pieces;

export type ChessPieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";

const Pieces: Record<ChessPieceType, PieceData> = piecesData as Record<ChessPieceType, PieceData>;

type PieceData = {
  width: number;
  height: number;
  paths: {
    path: string;
    color: string;
  } [];
};


interface PieceSymbolProps {
  type: SupportedPieces;
  scale?: number;
  color?: string;
  animate?: boolean
}

export function PieceSymbol({animate = false, ...props}: PieceSymbolProps): JSX.Element {
  
  const { type, scale = 1, color = "#FFFFFF" } = props;

  const pieceData = Pieces[type];

  const { paths } = pieceData;

  const height = (275 / Settings.boardSize)
  const width = (275 / Settings.boardSize)


  const scaledHeight: Devvit.Blocks.SizeString = `${height * scale}px`;
  const scaledWidth: Devvit.Blocks.SizeString = `${width * scale}px`;

  const animationClass = animate ? 'tilt-animation' : '';

   

    // Create SVG paths with multiple colors
    const pathElements = paths.map((pathData, index) => {
      // If preserveColors is false, use the provided color for all paths
      const fillColor = pathData.color;
      
      return `<path
        d="${pathData.path}"
        stroke="${fillColor}"
        stroke-width="1"
        fill="none"
      />`;
    }).join('');

    const animationStyle = animate ? 
    `<style>
      @keyframes tilt {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(8deg); }
        75% { transform: rotate(-8deg); }
        100% { transform: rotate(0deg); }
      }
      .animated {
        animation: tilt 1s ease-in-out infinite;
        transform-origin: ${Settings.boardSize}px ${Settings.boardSize}px;
      }
    </style>` : '';

    const pathsWithAnimation = animate ? 
    `<g class="animated">${pathElements}</g>` : 
    pathElements;


  return (
    <image
      imageHeight={scaledHeight}
      imageWidth={scaledWidth}
      height={scaledHeight}
      width={scaledWidth}
      description={type}
      

      
      resizeMode="scale-down"
      url={`data:image/svg+xml,
        <svg
          width="${width}"
          height="${height}"
          viewBox="0 0 ${Settings.boardSize*2} ${Settings.boardSize*2}"
          xmlns="http://www.w3.org/2000/svg"
          shape-rendering="crispEdges"
        >
        ${animationStyle}
        ${pathsWithAnimation}
        </svg>
      `}
    />
  );
}
