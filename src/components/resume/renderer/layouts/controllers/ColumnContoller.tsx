import { TabsContent } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { forwardRef, useState, useEffect } from "react";
import { ColorPicker } from "@/components/color-picker";
import { Input } from "@/components/ui/input";
import { Lock, AlignStartHorizontal, AlignStartVertical, AlignEndHorizontal, AlignCenter, AlignEndVertical, Image, ImageOff, Loader2, Search, ArrowLeftRight, Unlock } from "lucide-react";


export interface IValues {
  barColor?: string;
  isBarOpen?: boolean;
  barPosition?: 'top' | 'bottom' | 'left' | 'right';
  barSize?: number;
  borderRadius: { topLeft: number | null; topRight: number | null; bottomLeft: number | null; bottomRight: number | null; };
  bgImage?: string;
  bgPosition?: string;
  gap?: number;
}
export interface TemplateControlsProps {
  value: IValues;
  onChange: (newValue: IValues) => void;
}

export const ColumnContoller = forwardRef<HTMLDivElement, TemplateControlsProps>(({
  value,
  onChange
}, ref) => {

  console.log("ColumnContoller recebeu value:", { 
    completo: value, 
    bgImage: value.bgImage,
    definido: value.bgImage !== undefined
  });
  
  // Logging inicial (apenas uma vez)
  useEffect(() => {
    console.log("ColumnContoller montado com value inicial:", {
      completo: value,
      bgImage: value.bgImage,
      definido: value.bgImage !== undefined
    });
  }, []);

  const [isRadiusLocked, setIsRadiusLocked] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState(value.bgImage || "");
  
  console.log("ColumnContoller imageUrlInput inicial:", imageUrlInput);
  
  // --- Estados para o Banco de Imagens ---
  const [imageBankImages, setImageBankImages] = useState<any[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imageBankError, setImageBankError] = useState<string | null>(null);
  const [imageSearchQuery, setImageSearchQuery] = useState("abstract");

  const unsplashApiKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

  // Atualiza imageUrlInput se value.bgImage mudar externamente
  useEffect(() => {
    console.log("ColumnContoller useEffect [value.bgImage]:", { 
      valueBgImage: value.bgImage, 
      imageUrlInput: imageUrlInput,
      diferentes: value.bgImage !== imageUrlInput 
    });
    
    if (value.bgImage !== imageUrlInput) {
      console.log("ColumnContoller atualizando imageUrlInput para:", value.bgImage || "");
      setImageUrlInput(value.bgImage || "");
    }
  }, [value.bgImage, imageUrlInput]);


  const fetchUnsplashImages = async (query: string) => {
    if (!unsplashApiKey) {
      console.error("Chave da API do Unsplash não configurada em .env.local (NEXT_PUBLIC_UNSPLASH_ACCESS_KEY)");
      setImageBankError("Chave da API não configurada.");
      return;
    }
    if (!query || query.trim() === "") {
      setImageBankError("Digite um termo para buscar.");
      setImageBankImages([]);
      return;
    }
    setIsLoadingImages(true);
    setImageBankError(null);
    setImageBankImages([]);
    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=15&orientation=squarish&client_id=${unsplashApiKey}`);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setImageBankImages(data.results);
    } catch (error: any) {
      console.error("Erro ao buscar imagens do Unsplash:", error);
      setImageBankError(`Falha ao buscar: ${error.message}`);
      setImageBankImages([]);
    } finally {
      setIsLoadingImages(false);
    }
  };

  useEffect(() => {
    if(unsplashApiKey) fetchUnsplashImages(imageSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unsplashApiKey]); // Removido imageSearchQuery daqui para evitar busca na digitação

  const handleImageSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    fetchUnsplashImages(imageSearchQuery);
  };

  // Helper para atualizar o estado externo
  const handleChange = (key: keyof IValues, val: any) => {
    console.log(`ColumnContoller handleChange chamado para ${key}:`, val);
    // Cria uma cópia explícita do objeto value atual
    const updatedValue = { ...value };
    
    // Verifica o valor atual de bgImage para debugging
    console.log("Antes de atualizar, bgImage =", updatedValue.bgImage);
    
    // Atualiza a propriedade específica
    (updatedValue as any)[key] = val;
    
    console.log("Após atualizar, objeto completo =", updatedValue);
    
    // Chama o onChange com o objeto atualizado
    onChange(updatedValue);
  };

  const genereteRandomImage = () => {
    const randomImage = `https://picsum.photos/2000/2200?random=${Math.random()}`;
    console.log("ColumnContoller gerando imagem aleatória:", randomImage);
    
    // Atualiza ambos os valores de uma vez
    const updatedValue = { ...value, bgImage: randomImage, bgPosition: 'center center' };
    onChange(updatedValue);
    
    setImageUrlInput(randomImage); // Sincroniza input local
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("ColumnContoller arquivo selecionado:", file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log("ColumnContoller arquivo carregado, resultado:", result.substring(0, 50) + "...");
        
        // Atualiza ambos os valores de uma vez
        const updatedValue = { ...value, bgImage: result, bgPosition: 'center center' };
        onChange(updatedValue);
        
        setImageUrlInput(result); // Sincroniza input local
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlApply = () => {
    if (imageUrlInput.trim()) {
      console.log("ColumnContoller aplicando URL:", imageUrlInput);
      if (imageUrlInput.startsWith('http://') || imageUrlInput.startsWith('https://')) {
        // Atualiza ambos os valores de uma vez
        const updatedValue = { ...value, bgImage: imageUrlInput, bgPosition: 'center center' };
        onChange(updatedValue);
      } else {
        console.warn("URL da imagem inválida");
        alert("Por favor, insira uma URL válida (começando com http:// ou https://)");
      }
    }
  };

  const handleRadiusChange = (corner: keyof IValues['borderRadius'], rawValue: string) => {
    const numValue = parseInt(rawValue, 10);
    // Usar NaN para resetar se o input estiver vazio ou inválido, permitindo null
    const clampedValue = isNaN(numValue) ? null : Math.max(0, Math.min(100, numValue));


    let newBorderRadius: IValues['borderRadius'];
    if (isRadiusLocked) {
      newBorderRadius = {
        topLeft: clampedValue,
        topRight: clampedValue,
        bottomLeft: clampedValue,
        bottomRight: clampedValue,
      };
    } else {
      newBorderRadius = {
        ...value.borderRadius,
        [corner]: clampedValue,
      };
    }
    handleChange('borderRadius', newBorderRadius);
  };



  const PositionButton = ({ positionVal, icon, label }: { positionVal: string, icon: React.ReactNode, label: string }) => (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-7 w-7",
              value.bgPosition === positionVal && "ring-2 ring-primary ring-offset-1 ring-offset-background"
            )}
            onClick={() => handleChange('bgPosition', positionVal)}
            data-state={value.bgPosition === positionVal ? 'on' : 'off'}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderBarControls = () => (
    <Tabs defaultValue="estilo" className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-9 mb-3">
        <TabsTrigger value="estilo" className="text-xs px-1">Estilo da coluna</TabsTrigger>
        <TabsTrigger value="fundo" className="text-xs px-1">Background</TabsTrigger>
      </TabsList>

      <TabsContent value="estilo" className="space-y-3 mt-0">
        <div className="p-3 rounded-md border border-border/50 bg-background/30 space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground">Cor e Tamanho</h3>
          <div className="flex justify-center items-center gap-2">
            <ColorPicker 
              color={value.barColor || '#000000'} 
              setColor={(newColor) => handleChange('barColor', newColor)} 
            />
            <Input 
              type="number" 
              value={value.barSize === undefined || value.barSize === null ? '' : value.barSize}
              onChange={(e) => handleChange('barSize', e.target.value === '' ? null : parseInt(e.target.value, 10))} 
              className="w-20 h-7 text-xs"
              placeholder="Tamanho"
            />
          </div>
        </div>
        <div className="p-3 rounded-md border border-border/50 bg-background/30 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-medium text-muted-foreground">Raio de Borda (px)</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsRadiusLocked(!isRadiusLocked)} className="w-7 h-7" title={isRadiusLocked ? "Desbloquear cantos" : "Bloquear cantos"}>
              {isRadiusLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 items-center justify-items-center">
            <div className="flex items-center gap-1.5">
              <CornerTopLeft />
              <Input type="number" value={value.borderRadius?.topLeft ?? ''} min={0} max={100} className="w-14 h-7 text-xs" onChange={(e) => handleRadiusChange('topLeft', e.target.value)} placeholder="0"/>
            </div>
            <div className="flex items-center gap-1.5">
              <Input type="number" value={value.borderRadius?.topRight ?? ''} min={0} max={100} className="w-14 h-7 text-xs" onChange={(e) => handleRadiusChange('topRight', e.target.value)} placeholder="0"/>
              <CornerTopRight />
            </div>
            <div className="flex items-center gap-1.5">
              <CornerBottomLeft />
              <Input type="number" value={value.borderRadius?.bottomLeft ?? ''} min={0} max={100} className="w-14 h-7 text-xs" onChange={(e) => handleRadiusChange('bottomLeft', e.target.value)} placeholder="0"/>
            </div>
            <div className="flex items-center gap-1.5">
              <Input type="number" value={value.borderRadius?.bottomRight ?? ''} min={0} max={100} className="w-14 h-7 text-xs" onChange={(e) => handleRadiusChange('bottomRight', e.target.value)} placeholder="0"/>
              <CornerBottomRight />
            </div>
          </div>
        </div>
      </TabsContent>


      <TabsContent value="fundo" className="space-y-3 mt-0">
        <div className="p-3 rounded-md border border-border/50 bg-background/30 space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground">Imagem de Fundo (Barra)</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={genereteRandomImage} className="flex-1"><Image size={14} className="mr-1.5" />Aleatória</Button>
            <Button variant="outline" size="sm" onClick={() => document.getElementById('bg-image-upload')?.click()} className="flex-1">Carregar</Button>
            <input type="file" id="bg-image-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
          <div className="flex gap-2 items-center">
            <Input 
              type="url" 
              placeholder="URL da imagem..." 
              value={imageUrlInput} 
              onChange={(e) => setImageUrlInput(e.target.value)} 
              className="h-8 text-sm flex-grow" 
            />
            <Button variant="outline" size="sm" onClick={handleUrlApply} disabled={!imageUrlInput.trim()} className="whitespace-nowrap">Aplicar URL</Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              console.log("ColumnContoller removendo bgImage");
              // Atualiza ambos os valores de uma vez
              const updatedValue = { ...value, bgImage: undefined, bgPosition: undefined };
              onChange(updatedValue);
              setImageUrlInput(""); // Limpa input local
            }} 
            className="w-full"
          >
            <ImageOff size={14} className="mr-1.5" />
            Remover Imagem da Barra
          </Button>
        </div>
        <div className="p-3 rounded-md border border-border/50 bg-background/30 space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground">Banco de Imagens (Unsplash)</h3>
          {!unsplashApiKey && (
            <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-md">Configure sua chave Unsplash em <code>.env.local</code> (NEXT_PUBLIC_UNSPLASH_ACCESS_KEY).</p>
          )}
          <form onSubmit={handleImageSearch} className="flex gap-1.5">
            <Input
              type="search"
              placeholder="Buscar imagens..."
              value={imageSearchQuery}
              onChange={(e) => setImageSearchQuery(e.target.value)}
              className="h-8 text-xs flex-grow"
              disabled={!unsplashApiKey || isLoadingImages}
            />
            <Button type="submit" variant="outline" size="icon" className="w-8 h-8" disabled={!unsplashApiKey || isLoadingImages}>
              {isLoadingImages ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            </Button>
          </form>
          {isLoadingImages && imageBankImages.length === 0 && (
            <div className="flex justify-center items-center h-24 text-muted-foreground">
              <Loader2 size={20} className="animate-spin mr-2" /> Buscando...
            </div>
          )}
          {imageBankError && !isLoadingImages && (
            <p className="text-xs text-destructive text-center py-2">{imageBankError}</p>
          )}
          <div
            className={cn(
              "grid grid-cols-3 gap-1.5 max-h-[180px] overflow-y-auto p-0.5 rounded-md",
              imageBankImages.length > 0 && "border border-border/30",
              isLoadingImages && imageBankImages.length > 0 && "opacity-50 pointer-events-none"
            )}
          >
            {isLoadingImages && imageBankImages.length > 0 && (
              <div className="absolute inset-0 flex justify-center items-center bg-background/50 z-10">
                <Loader2 size={20} className="animate-spin text-foreground" />
              </div>
            )}
            {imageBankImages.map(img => (
              <button
                key={img.id}
                onClick={() => {
                  console.log("ColumnContoller imagem Unsplash selecionada:", {
                    id: img.id,
                    url: img.urls.regular
                  });
                  
                  // Atualiza ambos os valores de uma vez
                  const updatedValue = { ...value, bgImage: img.urls.regular, bgPosition: 'center center' };
                  onChange(updatedValue);
                  
                  setImageUrlInput(img.urls.regular); // Sincroniza input local
                }}
                className="aspect-square bg-muted hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:ring-offset-background rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background transition-all relative group"
                title={`Foto por ${img.user.name} no Unsplash`}
              >
                <img
                  src={img.urls.thumb}
                  alt={img.alt_description || `Imagem de ${imageSearchQuery}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
          {!isLoadingImages && imageBankImages.length === 0 && !imageBankError && unsplashApiKey && (
            <p className="text-xs text-muted-foreground text-center h-10 flex items-center justify-center">Nenhuma imagem encontrada.</p>
          )}
        </div>
        <div className="p-3 rounded-md border border-border/50 bg-background/30 space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">Posição Imagem Fundo</h3>
          <div className="flex justify-center gap-1.5 flex-wrap">
            <PositionButton positionVal="left top" icon={<AlignStartHorizontal size={14} className="transform -rotate-45" />} label="Topo Esquerda" />
            <PositionButton positionVal="center top" icon={<AlignStartVertical size={14} />} label="Topo" />
            <PositionButton positionVal="right top" icon={<AlignEndHorizontal size={14} className="transform rotate-45" />} label="Topo Direita" />
            <PositionButton positionVal="left center" icon={<AlignStartHorizontal size={14} />} label="Esquerda" />
            <PositionButton positionVal="center center" icon={<AlignCenter size={14} />} label="Centro" />
            <PositionButton positionVal="right center" icon={<AlignEndHorizontal size={14} />} label="Direita" />
            <PositionButton positionVal="left bottom" icon={<AlignStartHorizontal size={14} className="transform rotate-45" />} label="Base Esquerda" />
            <PositionButton positionVal="center bottom" icon={<AlignEndVertical size={14} />} label="Base" />
            <PositionButton positionVal="right bottom" icon={<AlignEndHorizontal size={14} className="transform -rotate-45" />} label="Base Direita" />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
      <div ref={ref} className="h-full w-full overflow-y-auto p-1">
        {renderBarControls()}
      </div>
  );

});
ColumnContoller.displayName = "ColumnContoller";


const CornerIcon = ({ className }: { className?: string }) => (<div className={`w-3 h-3 border-muted-foreground ${className}`}></div>);
const CornerTopLeft = () => <CornerIcon className={`border-t border-l`} />;
const CornerTopRight = () => <CornerIcon className={`border-t border-r`} />;
const CornerBottomLeft = () => <CornerIcon className={`border-b border-l`} />;
const CornerBottomRight = () => <CornerIcon className={`border-b border-r`} />;