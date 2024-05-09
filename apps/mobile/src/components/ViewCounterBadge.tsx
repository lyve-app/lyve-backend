import { YStack } from "tamagui";
import React from "react";
import { SizableText } from "tamagui";
import { formatNumber } from "../utils/formatNumber";

interface ViewCounterBadgeProps {
  count: number;
}

const ViewCounterBadge: React.FC<ViewCounterBadgeProps> = ({ count }) => {
  return (
    <YStack
      width={41}
      height={26}
      backgroundColor="#15171899"
      alignItems="center"
      justifyContent="center"
      borderRadius={25}
    >
      <SizableText>{formatNumber(count) ?? 0}</SizableText>
    </YStack>
  );
};

export default ViewCounterBadge;
