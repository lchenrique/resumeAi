"use client";

import React from 'react';
import { useFloatingControls } from '../FloatingControlsProvider';
import ControlButton from '../base/ControlButton';
import ControlPanel from '../base/ControlPanel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface SpacingOptions {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const LayoutControl: React.FC = () => {
  const { controls, toggleControl } = useFloatingControls();
  const control = controls.layout;
  const [layoutOptions, setLayoutOptions] = React.useState({
    padding: { top: 16, right: 16, bottom: 16, left: 16 } as SpacingOptions,
    margin: { top: 0, right: 0, bottom: 0, left: 0 } as SpacingOptions,
    width: 100, // porcentagem
    flexDirection: 'column' as 'column' | 'row'
  });

  const handleSpacingChange = (
    type: 'padding' | 'margin',
    side: keyof SpacingOptions,
    value: string
  ) => {
    const numValue = parseInt(value);
    setLayoutOptions(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [side]: isNaN(numValue) ? 0 : Math.max(0, numValue)
      }
    }));
  };

  const spacingTabs = new Map<string, {label: string, type: 'padding' | 'margin'}>([
    ['padding', {label: 'Padding (px)', type: 'padding'}],
    ['margin', {label: 'Margin (px)', type: 'margin'}]
  ]);

  return (
    <>
      <ControlButton
        onClick={() => toggleControl('layout')}
        isOpen={control.isOpen}
        icon={control.icon}
        label={control.label}
        position={control.position}
      />
      
      <ControlPanel
        isOpen={control.isOpen}
        onClose={() => toggleControl('layout')}
        position={control.position}
        title="Controle de Layout"
      >
        <Tabs defaultValue="padding" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="padding">Padding</TabsTrigger>
            <TabsTrigger value="margin">Margin</TabsTrigger>
            <TabsTrigger value="tamanho">Tamanho</TabsTrigger>
          </TabsList>
          
          {Array.from(spacingTabs.entries()).map(([tabValue, config]) => (
            <TabsContent value={tabValue} className="space-y-3 pt-3" key={tabValue}>
              <div className="space-y-1">
                <Label className="text-xs">{config.label}</Label>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {(Object.keys(layoutOptions[config.type]) as (keyof SpacingOptions)[]).map(side => (
                    <div key={side}>
                      <Label htmlFor={`${config.type}-${side}`} className="text-xs capitalize">{side}</Label>
                      <Input
                        id={`${config.type}-${side}`}
                        type="number"
                        min="0"
                        value={layoutOptions[config.type][side].toString()}
                        onChange={(e) => handleSpacingChange(config.type, side, e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
          
          <TabsContent value="tamanho" className="space-y-3 pt-3">
            <div className="space-y-1">
              <Label htmlFor="width" className="text-xs">Largura (%)</Label>
              <Input
                id="width"
                type="number"
                min="10"
                max="100"
                value={layoutOptions.width.toString()}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setLayoutOptions({
                    ...layoutOptions,
                    width: isNaN(value) ? 100 : Math.min(100, Math.max(10, value))
                  });
                }}
                className="h-8 text-xs"
              />
            </div>
              
            <div className="space-y-1 pt-2">
              <Label className="text-xs">Direção do Flex</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Button
                  variant={layoutOptions.flexDirection === 'column' ? 'secondary' : 'outline'}
                  size="sm"
                  className="text-xs h-8 justify-center"
                  onClick={() => setLayoutOptions({...layoutOptions, flexDirection: 'column'})}
                >
                  Coluna
                </Button>
                <Button
                  variant={layoutOptions.flexDirection === 'row' ? 'secondary' : 'outline'}
                  size="sm"
                  className="text-xs h-8 justify-center"
                  onClick={() => setLayoutOptions({...layoutOptions, flexDirection: 'row'})}
                >
                  Linha
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ControlPanel>
    </>
  );
};

export default LayoutControl; 