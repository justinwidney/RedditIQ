import { Context, Devvit, useState } from "@devvit/public-api";
import { PageCarousel } from "./RandomizePage.js";
import { IQScoreOverlay } from "./Overlay.js";

export const GameScreen = (props: {}, context: Context): JSX.Element => {
  // Game state
  const [currentPage, setCurrentPage] = useState("carousel");
  const [targetPageIndex, setTargetPageIndex] = useState(0);
  
  // IQ state
  const [currentIQ, setCurrentIQ] = useState(100); // Start with 100 IQ
  const [showIQOverlay, setShowIQOverlay] = useState(false);
  const [newIQ, setNewIQ] = useState<number>(100);
  
  // Handle game completion - this would be called after answering a question
  const handleQuestionComplete = (correct: boolean) => {
    // Calculate new IQ based on answer
    const iqChange = correct ? Math.floor(Math.random() * 10) + 5 : -(Math.floor(Math.random() * 10) + 5);
    const updatedIQ = Math.max(50, Math.min(200, currentIQ + iqChange)); // Cap IQ between 50 and 200
    
    // Show the overlay with animation
    setNewIQ(updatedIQ);
    setShowIQOverlay(true);
  };
  
  // Handle when IQ animation is complete
  const handleIQAnimationComplete = () => {
    // Update the current IQ state after animation
    if (newIQ !== undefined) {
      setCurrentIQ(newIQ);
    }
    
    // At this point, the overlay will show "Tap to continue"
    // User needs to tap to dismiss
  };
  
  // Handle tap on overlay to dismiss
  const handleOverlayTap = () => {
    if (showIQOverlay) {
      setShowIQOverlay(false);
      setNewIQ(100);
      
      // Now prepare for next question or return to carousel
      setCurrentPage("carousel");
      setTargetPageIndex(Math.floor(Math.random() * 6)); // Choose random next game
    }
  };
  
  return (
    <zstack width="100%" height="100%">
      {/* Main game content */}
      {currentPage === "carousel" && (
        <PageCarousel
          onComplete={(pageName) => {
            setCurrentPage(pageName);
          }}
          onCancel={(skip) => {
            // Handle cancel logic
          }}
          targetPageIndex={targetPageIndex}
        />
      )}
      
      {/* Game-specific screens would be here based on currentPage */}
      
      {/* IQ Score overlay - shown after answering a question */}
      <hstack width="100%" height="100%" onPress={handleOverlayTap}>
        <IQScoreOverlay
          initialIQ={currentIQ}
          newIQ={newIQ}
          isVisible={showIQOverlay}
          onAnimationComplete={handleIQAnimationComplete}
        />
      </hstack>
    </zstack>
  );
};