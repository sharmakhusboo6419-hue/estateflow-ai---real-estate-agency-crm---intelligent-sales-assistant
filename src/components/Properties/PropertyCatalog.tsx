import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  X,
  Share2,
  Copy,
  Check,
  Calendar,
  Home,
} from 'lucide-react';
import { Property } from '../../types/realEstate';

interface PropertyCatalogProps {
  properties: Property[];
  onSelectPropertyForChat: (property: Property) => void;
}

export const PropertyCatalog: React.FC<PropertyCatalogProps> = ({
  properties,
  onSelectPropertyForChat,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [generatedPitch, setGeneratedPitch] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const filtered = properties.filter((p) => {
    if (filterType === 'All') return true;
    return p.propertyType === filterType;
  });

  const handleGeneratePitch = (prop: Property) => {
    const pitch = `Exclusive Listing: ${prop.title} in ${prop.location}.\n\nOffered at $${prop.price.toLocaleString()} • ${prop.bedrooms} Beds • ${prop.bathrooms} Baths • ${prop.sqft.toLocaleString()} sq ft\n\nKey Highlights:\n${prop.features.slice(0, 3).map((f) => `• ${f}`).join('\n')}\n\nPrivate tours and architectural dossiers available through EstateFlow. Inquire to reserve an appointment slot.`;
    setGeneratedPitch(pitch);
    setCopiedPitch(false);
  };

  const handleCopyPitch = () => {
    if (!generatedPitch) return;
    navigator.clipboard.writeText(generatedPitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="surface-card rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#dfc195]" />
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Agency Property Portfolio
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Complete architectural dossiers, HOA fee schedules, outdoor specifications, and verified viewing slots.
          </p>
        </div>

        {/* Filter by property type */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs scrollbar-none">
          {(['All', 'Penthouse', 'Villa', 'Modern Loft', 'Apartment'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer whitespace-nowrap text-xs ${
                filterType === type
                  ? 'bg-zinc-800 text-white border border-white/[0.1]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((prop) => (
          <div
            key={prop.id}
            className="surface-card surface-card-hover rounded-xl overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Photo & Overlays */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={prop.imageUrl}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-medium text-white border border-white/[0.1]">
                  {prop.propertyType}
                </div>
                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-emerald-400 font-mono font-semibold text-xs border border-white/[0.1]">
                  ${prop.price.toLocaleString()}
                </div>
                <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-emerald-500/90 text-zinc-950 font-semibold text-[9px]">
                  {prop.status}
                </div>
              </div>

              {/* Body Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-white text-sm line-clamp-1">{prop.title}</h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span className="truncate">{prop.address}</span>
                  </p>
                </div>

                {/* Key specs */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/[0.06] text-center text-xs bg-black/20 rounded-lg">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-normal">Beds</span>
                    <span className="font-mono font-semibold text-white text-xs">{prop.bedrooms}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-normal">Baths</span>
                    <span className="font-mono font-semibold text-white text-xs">{prop.bathrooms}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-normal">Area</span>
                    <span className="font-mono font-semibold text-white text-xs">{prop.sqft.toLocaleString()} <span className="text-[9px] font-normal text-zinc-400">sqft</span></span>
                  </div>
                </div>

                {/* Financial breakdown */}
                <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-white/[0.06] text-xs space-y-1">
                  <div className="flex justify-between text-zinc-400 text-[11px]">
                    <span>20% Down Payment:</span>
                    <span className="font-mono text-zinc-200 font-medium">
                      ${prop.downPayment20.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400 text-[11px]">
                    <span>Est. Monthly:</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      ~${prop.estMortgageMonthly.toLocaleString()}/mo
                    </span>
                  </div>
                </div>

                {/* Top Features */}
                <ul className="text-xs text-zinc-400 space-y-1">
                  {prop.features.slice(0, 2).map((feat, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-[#dfc195] font-bold">•</span>
                      <span className="line-clamp-1">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="p-4 pt-0 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSelectedProperty(prop);
                  setActiveGalleryIndex(0);
                  setGeneratedPitch(null);
                }}
                className="py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/[0.08] font-medium text-xs transition cursor-pointer"
              >
                Full Specs
              </button>
              <button
                onClick={() => onSelectPropertyForChat(prop)}
                className="py-2 px-3 rounded-lg bg-[#c8a97e] hover:bg-[#dfc195] text-zinc-950 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Test in Concierge</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full Spec Sheet Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="surface-elevated rounded-xl w-full max-w-2xl max-h-[calc(100dvh-2rem)] shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200 flex flex-col">
            <div className="relative aspect-[16/9] w-full shrink-0">
              <img
                src={
                  activeGalleryIndex === 0
                    ? selectedProperty.imageUrl
                    : selectedProperty.galleryUrls?.[activeGalleryIndex - 1] || selectedProperty.imageUrl
                }
                alt={selectedProperty.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md text-emerald-400 font-mono font-bold text-sm border border-white/[0.1]">
                ${selectedProperty.price.toLocaleString()}
              </div>

              {/* Photo Gallery Selector if Available */}
              {selectedProperty.galleryUrls && selectedProperty.galleryUrls.length > 0 && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 p-1 rounded-lg backdrop-blur-md border border-white/[0.1]">
                  <button
                    onClick={() => setActiveGalleryIndex(0)}
                    className={`w-7 h-5 rounded overflow-hidden border transition ${
                      activeGalleryIndex === 0 ? 'border-[#dfc195]' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={selectedProperty.imageUrl} alt="Main" className="w-full h-full object-cover" />
                  </button>
                  {selectedProperty.galleryUrls.map((url, gIdx) => (
                    <button
                      key={gIdx}
                      onClick={() => setActiveGalleryIndex(gIdx + 1)}
                      className={`w-7 h-5 rounded overflow-hidden border transition ${
                        activeGalleryIndex === gIdx + 1 ? 'border-[#dfc195]' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={url} alt={`Gallery ${gIdx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 max-h-[calc(100dvh-16rem)] overflow-y-auto">
              <div>
                <h2 className="text-base font-bold text-white">{selectedProperty.title}</h2>
                <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#dfc195]" />
                  <span>{selectedProperty.address} • Built {selectedProperty.yearBuilt}</span>
                </p>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {selectedProperty.description}
              </p>

              {/* Outdoor & HOA specs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
                  <span className="text-[10px] text-zinc-400 block mb-0.5">Outdoor Space</span>
                  <span className="font-medium text-zinc-200">{selectedProperty.outdoorArea}</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06]">
                  <span className="text-[10px] text-zinc-400 block mb-0.5">HOA Dues & Parking</span>
                  <span className="font-medium text-zinc-200">${selectedProperty.hoaMonthly}/mo • {selectedProperty.parkingSpaces} Spaces</span>
                </div>
              </div>

              {/* Features List */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Architectural Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  {selectedProperty.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#dfc195] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities List */}
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Building Amenities
                </h4>
                <div className="flex flex-wrap gap-1">
                  {selectedProperty.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/[0.06]"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Host Broker */}
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block">Host Broker</span>
                  <span className="font-semibold text-white text-xs">{selectedProperty.agentName}</span>
                  <span className="text-zinc-400 block mt-0.5 text-[11px] font-mono">{selectedProperty.agentPhone} • {selectedProperty.agentEmail}</span>
                </div>
                <button
                  onClick={() => handleGeneratePitch(selectedProperty)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/[0.08] font-medium transition cursor-pointer flex items-center gap-1.5 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#dfc195]" />
                  <span>Generate Pitch</span>
                </button>
              </div>

              {generatedPitch && (
                <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/[0.08] text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#dfc195]" /> AI Marketing Pitch:
                    </span>
                    <button
                      onClick={handleCopyPitch}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] transition cursor-pointer"
                    >
                      {copiedPitch ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPitch ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-zinc-300 whitespace-pre-line text-xs font-mono bg-black/20 p-2.5 rounded border border-white/[0.04] leading-relaxed">
                    {generatedPitch}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const prop = selectedProperty;
                    setSelectedProperty(null);
                    onSelectPropertyForChat(prop);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#c8a97e] hover:bg-[#dfc195] text-zinc-950 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Launch in Concierge</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
