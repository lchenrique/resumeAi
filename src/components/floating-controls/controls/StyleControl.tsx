"use client";

import React from 'react';
import { useFloatingControls } from '../FloatingControlsProvider';
import ControlButton from '../base/ControlButton';
import ControlPanel from '../base/ControlPanel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BorderSideValues, Options } from '@/components/editor/initial'; // Assumindo que estas interfaces existem
import { Button } from '@/components/ui/button';

const StyleControl: React.FC = () => {
  const { controls, toggleControl } = useFloatingControls();
  const control = controls.style;
  const [styleOptions, setStyleOptions] = React.useState<Partial<Options>>({
    bgColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
    // borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }, // Removido se não estiver em Options
    shadow: 'none'
  });

  return (
    <>
      <ControlButton
        onClick={() => toggleControl('style')}
        isOpen={control.isOpen}
        icon={control.icon}
        label={control.label}
      />
      
      <ControlPanel
        isOpen={control.isOpen}
        onClose={() => toggleControl('style')}
        title="Controle de Estilo"
      >
        <Tabs defaultValue="cores" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="cores">Cores</TabsTrigger>
            <TabsTrigger value="bordas">Bordas</TabsTrigger>
            <TabsTrigger value="sombras">Sombras</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cores" className="space-y-3 pt-3">
            <div className="space-y-1">
              <Label htmlFor="bg-color" className="text-xs">Cor de Fundo</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="bg-color"
                  type="color"
                  value={styleOptions.bgColor || '#ffffff'}
                  onChange={(e) => setStyleOptions({...styleOptions, bgColor: e.target.value})}
                  className="w-8 h-8 p-1 rounded"
                />
                <Input
                  value={styleOptions.bgColor || '#ffffff'}
                  onChange={(e) => setStyleOptions({...styleOptions, bgColor: e.target.value})}
                  className="flex-1 h-8 text-xs"
                  placeholder="#RRGGBB"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="bordas" className="space-y-3 pt-3">
            <div className="space-y-1">
              <Label htmlFor="border-color" className="text-xs">Cor da Borda</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="border-color"
                  type="color"
                  value={styleOptions.borderColor || '#000000'}
                  onChange={(e) => setStyleOptions({...styleOptions, borderColor: e.target.value})}
                  className="w-8 h-8 p-1 rounded"
                />
                <Input
                  value={styleOptions.borderColor || '#000000'}
                  onChange={(e) => setStyleOptions({...styleOptions, borderColor: e.target.value})}
                  className="flex-1 h-8 text-xs"
                  placeholder="#RRGGBB"
                />
              </div>
            </div>
              
            <div className="space-y-1 pt-2">
              <Label className="text-xs">Largura da Borda (px)</Label>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {(['top', 'right', 'bottom', 'left'] as (keyof BorderSideValues)[]).map(side => (
                  <div key={side}>
                    <Label htmlFor={`border-${side}`} className="text-xs capitalize">{side}</Label>
                    <Input
                      id={`border-${side}`}
                      type="number"
                      min="0"
                      value={(styleOptions.borderWidth?.[side] || 0).toString()}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setStyleOptions({
                          ...styleOptions,
                          borderWidth: {
                            ...(styleOptions.borderWidth as BorderSideValues),
                            [side]: isNaN(value) ? 0 : Math.max(0, value)
                          }
                        });
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sombras" className="space-y-3 pt-3">
            <div className="space-y-1">
              <Label className="text-xs">Sombra</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[
                  { label: 'Nenhuma', value: 'none' },
                  { label: 'Suave', value: 'shadow-sm' },
                  { label: 'Média', value: 'shadow-md' },
                  { label: 'Grande', value: 'shadow-lg' },
                ].map(shadow => (
                  <Button
                    key={shadow.value}
                    variant={styleOptions.shadow === shadow.value ? 'secondary' : 'outline'}
                    size="sm"
                    className="text-xs h-8 justify-center"
                    onClick={() => setStyleOptions({...styleOptions, shadow: shadow.value})}
                  >
                    {shadow.label}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ControlPanel>
    </>
  );
};

export default StyleControl; 