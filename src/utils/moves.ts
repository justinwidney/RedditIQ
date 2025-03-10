import Settings from '../Settings.json';


type Position = number;
type Path = Position[];

interface PathResult {
    destinations: Position[];
    paths: Path[];
    }


function indexToXY(index: number, boardSize: number): { x: number; y: number } {
    return {
      x: index %boardSize,
      y: Math.floor(index /boardSize),
    };
  }

  const coordsToIndex = (x:number, y:number) => {
    return y * Settings.boardSize + x;
  };






export const getKnightMoves = (position: number) => {
    if (position === null) return [];
    
    const { x, y } = indexToXY(position, Settings.boardSize);
    const possibleMoves = [
      { x: x + 2, y: y + 1 },
      { x: x + 2, y: y - 1 },
      { x: x - 2, y: y + 1 },
      { x: x - 2, y: y - 1 },
      { x: x + 1, y: y + 2 },
      { x: x + 1, y: y - 2 },
      { x: x - 1, y: y + 2 },
      { x: x - 1, y: y - 2 },
    ];

    return possibleMoves.filter(move => 
      move.x >= 0 && 
      move.x < Settings.boardSize && 
      move.y >= 0 && 
      move.y < Settings.boardSize
    ).map(move => coordsToIndex(move.x, move.y));

  }

// PAWN MOVEMENT
// direction: 1 for white (moving up), -1 for black (moving down)
export const getPawnMoves = (position: number, direction: number = -1, allowCapture: boolean = true) => {
    if (position === null) return [];
    
    const { x, y } = indexToXY(position , Settings.boardSize);
    const moves: number[] = [];
    
    // Forward move (non-capturing)
    const newY = y + direction;
    if (newY >= 0 && newY < Settings.boardSize) {
      moves.push(coordsToIndex(x, newY));
    }
 
    return moves;
  };



  // BISHOP MOVEMENT
export const getBishopMoves = (position: number, maxDistance: number = Settings.boardSize) => {
    if (position === null) return [];
    
    const { x, y } = indexToXY(position, Settings.boardSize);
    const moves: number[] = [];
    
    // Define the four diagonal directions
    const directions = [
      { dx: 1, dy: 1 },   // down-right
      { dx: 1, dy: -1 },  // up-right
      { dx: -1, dy: 1 },  // down-left
      { dx: -1, dy: -1 }, // up-left
    ];
    
    // Check each direction
    directions.forEach(({ dx, dy }) => {
      for (let dist = 1; dist <= maxDistance; dist++) {
        const newX = x + (dx * dist);
        const newY = y + (dy * dist);
        
        if (
          newX < 0 || 
          newX >= Settings.boardSize || 
          newY < 0 || 
          newY >= Settings.boardSize
        ) {
          break; // Stop in this direction if we hit the edge
        }
        
        moves.push(coordsToIndex(newX, newY));
      }
    });
    
    return moves;
  };

export const getRookMoves = (position: number, maxDistance: number = Settings.boardSize) => {
    if (position === null) return [];
    
    const { x, y } = indexToXY(position, Settings.boardSize);
    const moves: number[] = [];
    
    // Define the four orthogonal directions
    const directions = [
      { dx: 0, dy: 1 },  // down
      { dx: 0, dy: -1 }, // up
      { dx: 1, dy: 0 },  // right
      { dx: -1, dy: 0 }, // left
    ];
    
    // Check each direction
    directions.forEach(({ dx, dy }) => {
      for (let dist = 1; dist <= maxDistance; dist++) {
        const newX = x + (dx * dist);
        const newY = y + (dy * dist);
        
        if (
          newX < 0 || 
          newX >= Settings.boardSize || 
          newY < 0 || 
          newY >= Settings.boardSize
        ) {
          break; // Stop in this direction if we hit the edge
        }
        
        moves.push(coordsToIndex(newX, newY));
      }
    });
    
    return moves;
  };

// Get tiles traversed when moving a bishop from start to end
export const getBishopTraversal = (start: number, end: number): number[] => {
    const { x: startX, y: startY } = indexToXY(start, Settings.boardSize);
    const { x: endX, y: endY } = indexToXY(end, Settings.boardSize);
    
    // Ensure the move is diagonal (valid bishop move)
    const dx = endX - startX;
    const dy = endY - startY;
    
    if (Math.abs(dx) !== Math.abs(dy)) {
      return []; // Not a valid bishop move
    }
    
    const xDirection = dx > 0 ? 1 : -1;
    const yDirection = dy > 0 ? 1 : -1;
    const distance = Math.abs(dx); // Could also use Math.abs(dy)
    
    const traversedPositions: number[] = [];
    
    // Start from position 1 since we don't include the starting position
    for (let i = 0; i <= distance; i++) {
      const x = startX + (i * xDirection);
      const y = startY + (i * yDirection);
      traversedPositions.push(coordsToIndex(x, y));
    }
    
    return traversedPositions;
  };
  

// Get tiles traversed when moving a knight from start to end
export const getKnightTraversal = (start: number, end: number): number[] => {
    // Knight just jumps from start to end, so only return the end position
    return [start, end];
  };
  
  // Get tiles traversed when moving a pawn from start to end
  export const getPawnTraversal = (start: number, end: number): number[] => {
    // Pawn just moves from start to end, so only return the end position
    return [start, end];
  };
  
  // Get tiles traversed when moving a king from start to end
  export const getKingTraversal = (start: number, end: number): number[] => {
    // King just moves from start to end, so only return the end position
    return [start, end];
  };
  

  // Get tiles traversed when moving a rook from start to end
  export const getRookTraversal = (start: number, end: number): number[] => {
    const { x: startX, y: startY } = indexToXY(start, Settings.boardSize);
    const { x: endX, y: endY } = indexToXY(end, Settings.boardSize);
    
    // Ensure the move is along a rank or file (valid rook move)
    if (startX !== endX && startY !== endY) {
      return []; // Not a valid rook move
    }
    
    const traversedPositions: number[] = [];
    
    if (startX === endX) {
      // Moving vertically
      const direction = endY > startY ? 1 : -1;
      const distance = Math.abs(endY - startY);
      
      for (let i = 0; i <= distance; i++) {
        const y = startY + (i * direction);
        traversedPositions.push(coordsToIndex(startX, y));
      }
    } else {
      // Moving horizontally
      const direction = endX > startX ? 1 : -1;
      const distance = Math.abs(endX - startX);
      
      for (let i = 0; i <= distance; i++) {
        const x = startX + (i * direction);
        traversedPositions.push(coordsToIndex(x, startY));
      }
    }
    
    return traversedPositions;
  };
  
  // Get tiles traversed when moving a queen from start to end
  export const getQueenTraversal = (start: number, end: number): number[] => {
    const { x: startX, y: startY } = indexToXY(start, Settings.boardSize);
    const { x: endX, y: endY } = indexToXY(end, Settings.boardSize);
    
    const dx = endX - startX;
    const dy = endY - startY;
    
    // Check if it's a diagonal move
    if (Math.abs(dx) === Math.abs(dy)) {
      return getBishopTraversal(start, end);
    }
    
    // Check if it's a straight move
    if (startX === endX || startY === endY) {
      return getRookTraversal(start, end);
    }
    
    return []; // Not a valid queen move
  };

// QUEEN MOVEMENT (combination of bishop and rook)
export const getQueenMoves = (position: number, maxDistance: number = Settings.boardSize) => {
    if (position === null) return [];
    
    return [
      ...getBishopMoves(position, maxDistance),
      ...getRookMoves(position, maxDistance)
    ];
  };
  
export const getKingMoves = (position: number) => {
    if (position === null) return [];
    
    const { x, y } = indexToXY(position, Settings.boardSize);
    const moves: number[] = [];
    
    // Check all 8 surrounding squares
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        // Skip the current position (dx=0, dy=0)
        if (dx === 0 && dy === 0) continue;
        
        const newX = x + dx;
        const newY = y + dy;
        
        if (
          newX >= 0 && 
          newX < Settings.boardSize && 
          newY >= 0 && 
          newY < Settings.boardSize
        ) {
          moves.push(coordsToIndex(newX, newY));
        }
      }
    }
    
    return moves;
  };  

  export const getMoves = (piece: string, position: number) : number[] => {
    switch (piece) {
        case 'pawn':
             return getPawnMoves(position);
        case 'rook':
            return getRookMoves(position);
        case 'bishop':
            return getBishopMoves(position);
        case 'queen':
            return getQueenMoves(position);
        case 'king':
            return getKingMoves(position);
        case 'knight':
            return getKnightMoves(position);
        default:
            return []
    }
};
    
export const getTraversal = (piece: string, start: number, end: number) : number[] => {
    switch (piece) {
        case 'pawn':
             return getPawnTraversal(start, end);
        case 'rook':
            return getRookTraversal(start, end);
        case 'bishop':
            return getBishopTraversal(start, end);
        case 'queen':
            return getQueenTraversal(start, end);
        case 'king':
            return getKingTraversal(start, end);
        case 'knight':
            return  getKnightTraversal(start, end);
        default:
            return []
    }
};
