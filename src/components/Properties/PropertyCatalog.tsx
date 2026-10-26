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
    const pitch = `🏡 NEW EXCLUSIVE LISTING: ${prop.title} in ${prop.location}!\n\nListed at $${prop.price.toLocaleString()} • ${prop.bedrooms} Beds • ${prop.bathrooms} Baths • ${prop.sqft.toLocaleString()} sq ft\n\nHighlights:\n${prop.features.slice(0, 3).map((f) => `✨ ${f}`).join('\n')}\n\nPrivate showings now booking through EstateFlow AI. Direct message us or tap the link in bio to reserve your timing slot before this weekend's open house!`;
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
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Agency Property Portfolio & AI Knowledge Base
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Every blueprint, HOA fee breakdown, outdoor terrace spec, and photo is indexed into the AI engine for instant client responses.
          </p>
        </div>

        {/* Filter by property type */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          {(['All', 'Penthouse', 'Villa', 'Modern Loft', 'Apartment'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
                filterType === type
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
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
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between group backdrop-blur-md hover:shadow-black/50"
          >
            <div>
              {/* Photo & Price Badge */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={prop.imageUrl}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-white border border-slate-700/80 shadow-md">
                  {prop.propertyType}
                </div>
                <div className="absolute top-3 right-3 px-3.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25">
                  ${prop.price.toLocaleString()}
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-slate-950 font-extrabold text-[10px]">
                  {prop.status}
                </div>
              </div>

              {/* Body Info */}
              <div className="p-5 space-y-3.5">
                <div>
                  <h3 className="font-extrabold text-white text-base line-clamp-1">{prop.title}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{prop.address}</span>
                  </p>
                </div>

                {/* Key specs */}
                <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-800/80 text-center text-xs bg-slate-950/40 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Beds</span>
                    <span className="font-extrabold text-white text-sm">{prop.bedrooms}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Baths</span>
                    <span className="font-extrabold text-white text-sm">{prop.bathrooms}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Area</span>
                    <span className="font-extrabold text-white text-sm">{prop.sqft.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">sqft</span></span>
                  </div>
                </div>

                {/* Financial breakdown */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>20% Down Payment:</span>
                    <span className="text-slate-200 font-bold">
                      ${prop.downPayment20.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Est. Mortgage + HOA:</span>
                    <span className="text-emerald-300 font-extrabold">
                      ~${prop.estMortgageMonthly.toLocaleString()}/mo
                    </span>
                  </div>
                </div>

                {/* Top Features */}
                <ul className="text-xs text-slate-300 space-y-1.5">
                  {prop.features.slice(0, 2).map((feat, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                      <span className="text-amber-400 font-bold">•</span>
                      <span className="line-clamp-1">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="p-5 pt-0 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setSelectedProperty(prop);
                  setActiveGalleryIndex(0);
                  setGeneratedPitch(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
              >
                View Full Specs
              </button>
              <button
                onClick={() => onSelectPropertyForChat(prop)}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Test in AI Chat</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full Spec Sheet Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200 flex flex-col">
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
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-white hover:bg-slate-950 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-3 px-3.5 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md text-amber-300 font-black text-base border border-amber-500/30">
                ${selectedProperty.price.toLocaleString()}
              </div>

              {/* Photo Gallery Selector if Available */}
              {selectedProperty.galleryUrls && selectedProperty.galleryUrls.length > 0 && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl backdrop-blur-md border border-slate-800">
                  <button
                    onClick={() => setActiveGalleryIndex(0)}
                    className={`w-8 h-6 rounded-lg overflow-hidden border transition ${
                      activeGalleryIndex === 0 ? 'border-amber-400 ring-1 ring-amber-400' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={selectedProperty.imageUrl} alt="Main" className="w-full h-full object-cover" />
                  </button>
                  {selectedProperty.galleryUrls.map((url, gIdx) => (
                    <button
                      key={gIdx}
                      onClick={() => setActiveGalleryIndex(gIdx + 1)}
                      className={`w-8 h-6 rounded-lg overflow-hidden border transition ${
                        activeGalleryIndex === gIdx + 1 ? 'border-amber-400 ring-1 ring-amber-400' : 'border-transparent opacity-70'
                      }`}
                    >
                      <img src={url} alt={`Gallery ${gIdx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-h-[calc(100dvh-14rem)] overflow-y-auto">
              <div>
                <h2 className="text-xl font-black text-white">{selectedProperty.title}</h2>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedProperty.address} • Built in {selectedProperty.yearBuilt}</span>
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedProperty.description}
              </p>

              {/* Outdoor & HOA specs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Outdoor Space</span>
                  <span className="font-semibold text-slate-200">{selectedProperty.outdoorArea}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">HOA Dues & Valet</span>
                  <span className="font-semibold text-slate-200">${selectedProperty.hoaMonthly}/mo • {selectedProperty.parkingSpaces} Parking Spaces</span>
                </div>
              </div>

              {/* Features List */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
                  Key Architectural Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedProperty.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities List */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
                  Building Amenities & Concierge Services
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProperty.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold px-3 py-1 rounded-xl bg-slate-950 text-slate-300 border border-slate-800"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Agent contact & Pitch Generator */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Host Broker</span>
                  <span className="font-black text-white text-sm">{selectedProperty.agentName}</span>
                  <span className="text-slate-400 block mt-0.5">{selectedProperty.agentPhone} • {selectedProperty.agentEmail}</span>
                </div>
                <button
                  onClick={() => handleGeneratePitch(selectedProperty)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold hover:bg-indigo-500/30 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Generate Social Pitch</span>
                </button>
              </div>

              {generatedPitch && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Social Marketing Pitch:
                    </span>
                    <button
                      onClick={handleCopyPitch}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 font-bold text-[11px] transition cursor-pointer"
                    >
                      {copiedPitch ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPitch ? 'Copied!' : 'Copy Pitch'}</span>
                    </button>
                  </div>
                  <p className="text-slate-300 whitespace-pre-line text-xs font-mono bg-slate-900/80 p-3 rounded-xl border border-indigo-500/20 leading-relaxed">
                    {generatedPitch}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const prop = selectedProperty;
                    setSelectedProperty(null);
                    onSelectPropertyForChat(prop);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                  <span>Launch in AI Chatbot</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
