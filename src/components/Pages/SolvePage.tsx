import { Context, Devvit, useState } from "@devvit/public-api";
import { UserData } from "../../types.js";
import  Settings  from "../../Settings.json";
import { CustomButton } from "../Addons/CustomButton.js";
import { splitArray } from "../../utils/utils.js";
import { getMoves, getTraversal } from "../../utils/moves.js";
import { ChessPieceType, PieceSymbol } from "../Addons/PieceSymbol.js";
import { PixelSymbol } from "../Addons/PixelSymbol.js";


interface Pixel {
    color: number;
    drawn: boolean;
  }

interface SolvePageStepProps {
    //username: string | null;
    //userData: UserData | null;
    onCancel: () => void;
    onNext: () => void;
    picture?: {
        easy: Pixel[];
    }
}

interface ChessMove {
    from: number;
    to: number;
    [key: string]: any;
    piece: ChessPieceType;
  }
  
  interface drawData {
    color: number;
    drawn: boolean;
    [key: string]: any;
  }



export const SolvePageStep = (
    props: SolvePageStepProps,
    context: Context

    ): JSX.Element => {


    const {onNext, picture} = props;

    const [currentPosition, setCurrentPosition] = useState<number>(59);
    const [currentColor, setCurrentColor] = useState<number>(1);
    const [currentPiece, setCurrentPiece] = useState<string>('knight');
    const [highlightedMoves, setHighlightedMoves] = useState<number[]>([]);
    const [moves, setMoves] = useState<ChessMove[]>([]);
    const [drawingData, setDrawingData] = useState<drawData[]>(picture?.easy || []);



    const size = '275px';
    const innerSize = 275;
    const pixelSize: Devvit.Blocks.SizeString = `${innerSize / Settings.boardSize}px`;
    const pieceSize: Devvit.Blocks.SizeString = `${innerSize / Settings.boardSize}px`;
 
    const handlePieceClick = (pieceType: ChessPieceType) => {

        setCurrentPiece(pieceType);

        const newMoves = getMoves(pieceType, currentPosition);
        setHighlightedMoves(newMoves);

        const newData = [...drawingData];
        setDrawingData(newData);
        
      };
      
    const handlePixelClick = (index:number) => {

        const newData = [...drawingData];
        const availableMoves = getMoves(currentPiece, currentPosition);

        // Ignore bad clicks
        if (!availableMoves.includes(index)) {
          return
        }
      
        const traversal = getTraversal(currentPiece, currentPosition, index)
        const newMove : ChessMove = {
          from : traversal[0],
          to : traversal[traversal.length - 1],
          piece : currentPiece as ChessPieceType
        }
      
        setMoves([...moves, newMove]);
      
        // If we're just starting (no position yet) or clicking on a possible move
        if (currentPosition === null || traversal.includes(index)) {
          // If this is a move (not initial placement), draw at the destination
          if (currentPosition !== null) {
      
            traversal.forEach((moveIndex) => {
              //newData[moveIndex].color = 1;
              newData[moveIndex].drawn = true;
            }
            );
      
          }
          
          setCurrentPosition(index);
          newData[index].drawn = true;
          
          const newMoves = getMoves(currentPiece, index);
          setHighlightedMoves(newMoves);
      

        }
        
        // Update the drawing data state
        setDrawingData(newData);
      };
      
    const handleUndo = () => {

        const newData = [...drawingData];

        if (moves.length === 0) {
            return;
        }

        const lastMove = moves[moves.length - 1];
        const traversal = getTraversal(lastMove.piece, lastMove.to, lastMove.from);

        traversal.forEach((moveIndex) => {
            newData[moveIndex].drawn = false;
        });


        setCurrentPiece(lastMove.piece);
        setCurrentPosition(lastMove.from);
        setHighlightedMoves(getMoves(currentPiece, lastMove.from));
        setMoves(moves.slice(0, moves.length - 1));
        setDrawingData(newData);

    }   


    const piecePalette = (
        <hstack>
          {Settings.pieces.map((c, i) => (
            <>
                <vstack height="38.75px" width="38.75px" padding="xsmall" backgroundColor='black' >
                  <vstack
                    height="100%"
                    width="100%"
                    backgroundColor='white'
                    alignment="center middle"
                    onPress={() => {
                      handlePieceClick(c);
                    }}
                  >
                      {isValidPieceType(c) && <PieceSymbol type={c} color='black' animate={
                        currentPiece===c? true : false
                      }/> }
              
                  </vstack>
                </vstack>
              {i !== Settings.colors.length - 1 && <spacer size="xsmall" />}
            </>
          ))}
        </hstack>
      );

    
    function isValidPieceType(pieceType: string): pieceType is ChessPieceType {
        return ["pawn", "rook", "knight", "bishop", "queen", "king"].includes(pieceType);
    }



    const pixels = drawingData.map((pixel, index) => (

        <>
        <hstack
          onPress={() => {
            handlePixelClick(index);
          }}
          height={pieceSize}
          width={pieceSize}
          backgroundColor={
            pixel.color === -2 ? "#000000" :
            currentPosition === index ? Settings.colors[2] :
            pixel.drawn === true ? Settings.colors[pixel.color] : 
            "transparent"
          }
    
        > 

        {highlightedMoves.includes(index) && !pixel.drawn && pixel.color!== -2 && <PixelSymbol type="available" scale={2} color="#0000FF" /> }
          
    
        {index === currentPosition && isValidPieceType(currentPiece) && <PieceSymbol type={currentPiece} color='black' /> }
    
        </hstack>
        </>
      ));

      const grid = (
        <vstack height={size} width={size} padding="none">
          {splitArray(pixels, Settings.boardSize).map((row) => (
            <hstack>{row}</hstack>
          ))}
        </vstack>
      );

    
      return (
        <vstack width="100%" height="100%" alignment="center top" padding="large">
          {/* Header */}
          <hstack width="100%" alignment="middle">
            <vstack alignment="top start">
              
              <spacer size="small" />
              <hstack alignment="middle" gap="small">
               
              </hstack>
    
              {piecePalette}
    
            </vstack>
    
            <spacer grow />
    
            <CustomButton
              width="32px"
             height="32px"
             text="close"
              onClick={() => {
                props.onCancel();
              }}
            />
          </hstack>
    
          <spacer grow />
            <zstack height={size} width={size} alignment="middle center" backgroundColor="white">
              <image
                imageHeight={512}
                imageWidth={512}
                height={size}
                width={size}
                url="grid-template.png"
              />
              {grid}
            </zstack>
          <spacer grow />
          <hstack width="100%" alignment="center middle">
            <CustomButton
                width="32px"
                height="32px"
                text="redo"
                onClick={ () => {
                    console.log('handleUndo called at:', new Date().getTime());
                    handleUndo()}
                }
            />
            </hstack>
        </vstack>
      );

    }






