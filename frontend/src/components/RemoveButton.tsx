import { ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface RemoveButtonProps {
  onClick: () => void;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  iconSize?: number;
  className?: string;
  ariaLabel?: string;
}

export default function RemoveButton({
  onClick,
  size = "sm",
  iconSize = 14,
  className,
  ariaLabel = "Remove",
}: RemoveButtonProps) {


  return (
    <ActionIcon
      variant="subtle"
      size={size}
      aria-label={ariaLabel}
      color="gray"
      className={`remove-btn${className ? ` ${className}` : ""}`}
      onClick={onClick}
    >
      <IconX size={iconSize} stroke={2} />
    </ActionIcon>
  );
}
