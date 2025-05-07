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

export interface TemplateControlsProps {
    template?: string;
    barColor?: string;
    onChangeBarColor?: (color: string) => void;
    isBarOpen?: boolean;
    setIsOpen?: (isOpen: boolean) => void;
    barPosition?: 'top' | 'bottom' | 'left' | 'right';
    swapSidebar?: (position: 'top' | 'bottom' | 'left' | 'right') => void;
    barSize?: number;
    onChangeBarSize?: (size: number) => void;
    setBgImage: (bgImage: string | undefined) => void;
    borderRadius: { topLeft: number | null; topRight: number | null; bottomLeft: number | null; bottomRight: number | null; };
    setBorderRadius: (borderRadius: { topLeft: number | null; topRight: number | null; bottomLeft: number | null; bottomRight: number | null; }) => void;
    bgPosition?: string;
    setBgPosition?: (position: string) => void;
  }
  
export const TwoColumnController = forwardRef<HTMLDivElement, { template: string; } & TemplateControlsProps>(({
    template,
    barColor,
    onChangeBarColor,   
    isBarOpen,
    setIsOpen,
    barPosition,
    swapSidebar,
    barSize,
    onChangeBarSize,
    setBgImage,
    borderRadius,
    setBorderRadius,
    bgPosition = 'center',
    setBgPosition
  }, ref) => {
  
    const [isRadiusLocked, setIsRadiusLocked] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState("");
    // --- Estados para o Banco de Imagens ---
    const [imageBankCategory, setImageBankCategory] = useState("abstract"); // Categoria inicial
    const [imageBankImages, setImageBankImages] = useState<any[]>([]); // Armazenar resultados da API
    const [isLoadingImages, setIsLoadingImages] = useState(false);
    const [imageBankError, setImageBankError] = useState<string | null>(null);
    const [imageSearchQuery, setImageSearchQuery] = useState("abstract"); // Estado para a busca
  
    // Lista de categorias sugeridas (pode vir da API se preferir)
    const imageCategories = ["abstract", "nature", "technology", "textures", "gradients", "patterns", "business", "minimal"];
    const unsplashApiKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  
    // --- Função para buscar imagens no Unsplash ---
    const fetchUnsplashImages = async (query: string) => { // Modificado para aceitar query
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
      setImageBankImages([]); // Limpa imagens anteriores
      try {
        // Busca por fotos relevantes para a query
        const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=15&orientation=squarish&client_id=${unsplashApiKey}`); // Aumentado per_page
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
  
    // Busca imagens inicial (opcional, pode remover se quiser começar vazio)
    useEffect(() => {
      fetchUnsplashImages(imageSearchQuery);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unsplashApiKey]); // Executa apenas uma vez na montagem (ou se a key mudar)
  
    // Handler para iniciar a busca
    const handleImageSearch = (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault(); // Previne recarregamento se estiver num form
      fetchUnsplashImages(imageSearchQuery);
    }
  
    const genereteRandomImage = () => {
      const randomImage = `https://picsum.photos/2000/2200?random=${Math.random()}`;
      setBgImage(randomImage);
      if (setBgPosition) setBgPosition('center'); // Usa setBgPosition diretamente
    };
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBgImage(reader.result as string);
          if (setBgPosition) setBgPosition('center'); // Usa setBgPosition diretamente
        };
        reader.readAsDataURL(file);
      }
    };
  
    const handleUrlApply = () => {
      if (imageUrlInput.trim()) {
        if (imageUrlInput.startsWith('http://') || imageUrlInput.startsWith('https://')) {
          setBgImage(imageUrlInput);
          if (setBgPosition) setBgPosition('center'); // Usa setBgPosition diretamente
        } else {
          console.warn("URL da imagem inválida");
          alert("Por favor, insira uma URL válida (começando com http:// ou https://)");
        }
      }
    };
  
    // ---> Função centralizada para alterar o raio
    const handleRadiusChange = (corner: keyof typeof borderRadius, value: string) => {
      const numValue = parseInt(value, 10) || 0;
      // Aplicar limites (opcional, mas bom)
      const clampedValue = Math.max(0, Math.min(100, numValue));
  
      if (isRadiusLocked) {
        // Atualiza todos se estiver travado
        setBorderRadius({
          topLeft: clampedValue,
          topRight: clampedValue,
          bottomLeft: clampedValue,
          bottomRight: clampedValue,
        });
      } else {
        // Atualiza apenas o canto específico se destravado
        setBorderRadius({
          ...borderRadius, // Pega o estado atual
          [corner]: clampedValue, // Atualiza apenas a chave do canto
        });
      }
    };
  
    // ---> Lógica para alternar posição da barra (CICLO)
    const handleToggleBarPosition = () => {
      if (!swapSidebar || !barPosition) return;
      let nextPosition: 'top' | 'bottom' | 'left' | 'right';
      switch (barPosition) {
        case 'left': nextPosition = 'right'; break;
        case 'right': nextPosition = 'top'; break;
        case 'top': nextPosition = 'bottom'; break;
        case 'bottom': nextPosition = 'left'; break;
        default: nextPosition = 'left'; // Fallback
      }
      swapSidebar(nextPosition);
    };
  
    // ---> Label dinâmico para o botão de posição (CICLO)
    const getTogglePositionLabel = () => {
      if (!barPosition) return "Trocar Posição";
      switch (barPosition) {
        case 'left': return "Mover para Direita";
        case 'right': return "Mover para Topo";
        case 'top': return "Mover para Rodapé";
        case 'bottom': return "Mover para Esquerda";
        default: return "Trocar Posição";
      }
    };
  
    // Botão de posição com Tooltip
    const PositionButton = ({ positionValue, icon, label }: { positionValue: string, icon: React.ReactNode, label: string }) => (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-7 w-7 data-[state=on]:ring-2 data-[state=on]:ring-primary data-[state=on]:ring-offset-1 data-[state=on]:ring-offset-background", // Melhorar destaque ativo
                bgPosition === positionValue && "ring-2 ring-primary ring-offset-1 ring-offset-background" // Manter fallback se state não funcionar
              )}
              onClick={() => { if (setBgPosition) setBgPosition(positionValue); }} // Usa setBgPosition diretamente
              disabled={!setBgPosition}
              // Adicionar state para toggle visual (opcional, depende do Button)
              data-state={bgPosition === positionValue ? 'on' : 'off'}
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
  
    // ---> Unificar Conteúdo da UI para templates com barra
    const renderBarControls = () => (
      <Tabs defaultValue="estilo" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-9 mb-3">
          <TabsTrigger value="estilo" className="text-xs px-1">Estilo Barra</TabsTrigger>
          <TabsTrigger value="posicao" className="text-xs px-1">Posição</TabsTrigger>
          <TabsTrigger value="fundo" className="text-xs px-1">Fundo Barra</TabsTrigger>
        </TabsList>
  
        {/* --- Aba Estilo Barra --- */}
        <TabsContent value="estilo" className="space-y-3 mt-0">
          <div className="p-3 rounded-md border border-border/50 bg-background/30 space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground">Cor e Tamanho</h3>
            <div className="flex justify-center">
              <ColorPicker color={barColor || '#000000'} setColor={onChangeBarColor || (() => { })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Tamanho Inicial (%)</label>
              <Input
                type="number"
                value={barSize}
                onChange={(e) => {
                  const newSize = parseInt(e.target.value, 10);
                  if (onChangeBarSize && !isNaN(newSize) && newSize >= 5 && newSize <= 50) {
                    onChangeBarSize(newSize);
                  }
                }}
                placeholder="ex: 15"
                min={5}
                max={50}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="p-3 rounded-md border border-border/50 bg-background/30 space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground">Raio de Borda (px)</h3>
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-medium text-muted-foreground">Raio de Borda (px)</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsRadiusLocked(!isRadiusLocked)} className="w-7 h-7" title={isRadiusLocked ? "Desbloquear" : "Bloquear"}>
                {isRadiusLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 items-center justify-items-center">
              <div className="flex items-center gap-1.5">
                <CornerTopLeft />
                <Input type="number" value={borderRadius.topLeft ?? 0} min={0} max={100} className="w-14 h-7 text-xs" onChange={(e) => handleRadiusChange('topLeft', e.target.value)} />
              </div>
              <div className="flex items-center gap-1.5">
                <Input type="number" value={borderRadius.topRight ?? 0} min={0} max={100} className="w-14 h-7 text-xs" onChange={(e) => handleRadiusChange('topRight', e.target.value)} />
                <CornerTopRight />
              </div>
              <div className="flex items-center gap-1.5">
                <CornerBottomLeft />
                <Input type="number" value={borderRadius.bottomLeft ?? 0} min={0} max={100} className="w-14 h-7 text-xs" onChange={(e) => handleRadiusChange('bottomLeft', e.target.value)} />
              </div>
              <div className="flex items-center gap-1.5">
                <Input type="number" value={borderRadius.bottomRight ?? 0} min={0} max={100} className="w-14 h-7 text-xs" onChange={(e) => handleRadiusChange('bottomRight', e.target.value)} />
                <CornerBottomRight />
              </div>
            </div>
          </div>
        </TabsContent>
  
        {/* --- Aba Posição Barra --- */}
        <TabsContent value="posicao" className="space-y-3 mt-0">
          <div className="p-3 rounded-md border border-border/50 bg-background/30 space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">Visibilidade e Posição</h3>
            <Button variant="outline" size="sm" onClick={() => setIsOpen ? setIsOpen(!isBarOpen) : null} className="w-full">{isBarOpen ? "Ocultar Barra" : "Mostrar Barra"}</Button>
            <Button variant="outline" size="sm" onClick={handleToggleBarPosition} className="w-full"><ArrowLeftRight size={14} className="mr-1.5" />{getTogglePositionLabel()}</Button>
          </div>
        </TabsContent>
  
        {/* --- Aba Fundo Barra --- */}
        <TabsContent value="fundo" className="space-y-3 mt-0">
          <div className="p-3 rounded-md border border-border/50 bg-background/30 space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground">Imagem de Fundo (Barra)</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={genereteRandomImage} className="flex-1"><Image size={14} className="mr-1.5" />Aleatória</Button>
              <Button variant="outline" size="sm" onClick={() => document.getElementById('bg-image-upload')?.click()} className="flex-1">Carregar</Button>
              <input type="file" id="bg-image-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
            <div className="flex gap-2 items-center">
              <Input type="url" placeholder="URL da imagem..." value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} className="h-8 text-sm flex-grow" />
              <Button variant="outline" size="sm" onClick={handleUrlApply} disabled={!imageUrlInput.trim()} className="whitespace-nowrap">Aplicar URL</Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setBgImage(undefined)} className="w-full">
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
                    setBgImage(img.urls.regular);
                    if (setBgPosition) setBgPosition('center');
                    setImageUrlInput('');
                  }}
                  className="aspect-square bg-muted hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:ring-offset-background rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background transition-all relative group"
                  title={`Foto por ${img.user.name} no Unsplash`}
                >
                  <img
                    src={img.urls.thumb}
                    alt={img.alt_description || `Imagem de ${imageBankCategory}`}
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
              <PositionButton positionValue="left top" icon={<AlignStartHorizontal size={14} className="transform -rotate-45" />} label="Topo Esquerda" />
              <PositionButton positionValue="center top" icon={<AlignStartVertical size={14} />} label="Topo" />
              <PositionButton positionValue="right top" icon={<AlignEndHorizontal size={14} className="transform rotate-45" />} label="Topo Direita" />
              <PositionButton positionValue="left center" icon={<AlignStartHorizontal size={14} />} label="Esquerda" />
              <PositionButton positionValue="center center" icon={<AlignCenter size={14} />} label="Centro" />
              <PositionButton positionValue="right center" icon={<AlignEndHorizontal size={14} />} label="Direita" />
              <PositionButton positionValue="left bottom" icon={<AlignStartHorizontal size={14} className="transform rotate-45" />} label="Base Esquerda" />
              <PositionButton positionValue="center bottom" icon={<AlignEndVertical size={14} />} label="Base" />
              <PositionButton positionValue="right bottom" icon={<AlignEndHorizontal size={14} className="transform -rotate-45" />} label="Base Direita" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    );
  
    // ---> Renderiza os controles APENAS para o template correto
    return (
      <div ref={ref} className="h-full w-full overflow-hidden">
       {renderBarControls()}
      </div>
    );
  
  });


const CornerIcon = ({ className }: { className?: string }) => (<div className={`w-4 h-4 border-border ${className}`}></div>);
const CornerTopLeft = () => <CornerIcon className={`border-t-2 rounded-tl-md border-l-2`} />;
const CornerTopRight = () => <CornerIcon className={`border-t-2 rounded-tr-md border-r-2`} />;
const CornerBottomLeft = () => <CornerIcon className={`border-b-2 rounded-bl-md border-l-2`} />;
const CornerBottomRight = () => <CornerIcon className={`border-b-2 rounded-br-md border-r-2`} />;