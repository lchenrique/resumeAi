export interface ControlPosition {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'right';
}

export interface ControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface ControlButtonProps {
  onClick: () => void;
  isOpen: boolean;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export type ControlType = 'style' | 'layout' | 'section' | 'order';

export interface Control {
  id: ControlType;
  isOpen: boolean;
  label: string;
  icon: React.ReactNode;
}

export interface ControlsContextType {
  controls: Record<ControlType, Control>;
  toggleControl: (id: ControlType) => void;
  closeAllControls: () => void;
} 