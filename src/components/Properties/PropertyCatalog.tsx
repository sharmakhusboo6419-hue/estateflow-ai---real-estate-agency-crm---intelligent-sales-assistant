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

  const filtered = properties.filter((p) => {
    if (filterType === 'All') return true;
    return p.propertyType === filterType;
  });

  const handleGeneratePitch = (prop: Property) => {
    const pitch = `🏡 NEW EXCLUSIVE LISTING: ${prop.title} in ${prop.location}!\n\nListed at $${prop.price.toLocaleString()} • ${prop.bedrooms} Beds • ${prop.bathrooms} Baths • ${prop.sqft} sq ft\n\nHighlights:\n${prop.features.slice(0, 3).map((f) => `✨ ${f}`).join('\n')}\n\nPrivate showings now booking through EstateFlow AI. Direct message us or tap the link in bio to reserve your timing slot before this weekend's open house!`;
    setGeneratedPitch(pitch);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            Agency Property Portfolio & AI Knowledge Base
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Every specification, floor plan, HOA fee, and amenity is indexed in the AI engine for instant client responses.
          </p>
        </div>

        {/* Filter by property type */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {(['All', 'Penthouse', 'Villa', 'Modern Loft', 'Apartment'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                filterType === type
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((prop) => (
          <div
            key={prop.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg transition flex flex-col justify-between group"
          >
            <div>
              {/* Photo & Price Badge */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={prop.imageUrl}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-white border border-slate-700">
                  {prop.propertyType}
                </div>
                <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs shadow-md">
                  ${prop.price.toLocaleString()}
                </div>
              </div>

              {/* Body Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-white text-base line-clamp-1">{prop.title}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{prop.address}</span>
                  </p>
                </div>

                {/* Key specs */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Beds</span>
                    <span className="font-bold text-white">{prop.bedrooms}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Baths</span>
                    <span className="font-bold text-white">{prop.bathrooms}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Area</span>
                    <span className="font-bold text-white">{prop.sqft} sqft</span>
                  </div>
                </div>

                {/* Financial breakdown */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>20% Down Payment:</span>
                    <span className="text-slate-200 font-semibold">
                      ${prop.downPayment20.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Est. Mortgage + HOA:</span>
                    <span className="text-emerald-400 font-bold">
                      ~${prop.estMortgageMonthly.toLocaleString()}/mo
                    </span>
                  </div>
                </div>

                {/* Top Features */}
                <ul className="text-xs text-slate-300 space-y-1">
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
            <div className="p-4 pt-0 grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedProperty(prop)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
              >
                Full Spec Sheet
              </button>
              <button
                onClick={() => onSelectPropertyForChat(prop)}
                className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Test AI Chat
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full Spec Sheet Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200">
            <div className="relative aspect-[16/9] w-full">
              <img
                src={selectedProperty.imageUrl}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-950 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md text-amber-300 font-extrabold text-sm border border-amber-500/30">
                ${selectedProperty.price.toLocaleString()}
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedProperty.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{selectedProperty.address}</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedProperty.description}
              </p>

              {/* Outdoor & HOA specs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Outdoor Area</span>
                  <span className="font-semibold text-slate-200">{selectedProperty.outdoorArea}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Monthly HOA Fees</span>
                  <span className="font-semibold text-slate-200">${selectedProperty.hoaMonthly}/mo</span>
                </div>
              </div>

              {/* Features List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                  Architectural & Interior Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedProperty.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                  Building Amenities & Services
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProperty.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Agent contact */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Listing Senior Agent</span>
                  <span className="font-bold text-white">{selectedProperty.agentName}</span>
                  <span className="text-slate-400 block">{selectedProperty.agentPhone}</span>
                </div>
                <button
                  onClick={() => handleGeneratePitch(selectedProperty)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold hover:bg-indigo-500/30 transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate MLS Pitch
                </button>
              </div>

              {generatedPitch && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
                  <span className="font-bold text-indigo-300 block">AI Generated Social Pitch:</span>
                  <p className="text-slate-300 whitespace-pre-line text-[11px]">
                    {generatedPitch}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const prop = selectedProperty;
                    setSelectedProperty(null);
                    onSelectPropertyForChat(prop);
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Test Client Inquiry in Chatbot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
