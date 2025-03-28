import { Context, useState, Devvit, useAsync } from "@devvit/public-api";
import { GAME_SVG } from "../../data/svgs.js";





type RowProps = {
  backgroundImageUrl: string;
  type: string;
  exampleText: string;
}

export const Banner = ( props: RowProps): JSX.Element => {

  const { backgroundImageUrl, type, exampleText} = props;

  const logoSvgUrl = GAME_SVG[type as keyof typeof GAME_SVG]


  return (
    <zstack alignment="bottom" width={"300px"} >
      {/* Background Image */}
      <image
        url={backgroundImageUrl}
        resizeMode="cover"
        height="135px"
        width="100%"
        imageWidth={300}
        imageHeight={300}
      />
      
      {/* Content overlay */}
      <vstack alignment="bottom start" width={"100%"}>
        {/* First text row */}
        <hstack backgroundColor="white" width={"100%"} alignment="center middle" height={"40px"} >
          <image
            imageHeight={64}
            imageWidth={64}
            width="128px"
            height="64px"
            url={logoSvgUrl}
          />
        </hstack>
        
      
      </vstack>
    </zstack>
  );
};