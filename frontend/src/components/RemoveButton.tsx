import { ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { RemoveButtonProps } from "../types/components";

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
