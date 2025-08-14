import { useGameState } from "../../lib/stores/useGameState";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Package, ScrollText, Star, Award } from "lucide-react";

export default function InventoryPanel() {
  const { showInventory, setShowInventory, inventory } = useGameState();

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'artifact': return Star;
      case 'knowledge': return ScrollText;
      case 'trophy': return Award;
      default: return Package;
    }
  };

  const getItemColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <Dialog open={showInventory} onOpenChange={setShowInventory}>
      <DialogContent className="max-w-4xl bg-gray-900 text-white border-gray-700 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />
            Inventory
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Inventory Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-3">
                <div className="text-xl font-bold text-blue-400">
                  {inventory.length}
                </div>
                <div className="text-xs text-gray-400">Total Items</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-3">
                <div className="text-xl font-bold text-yellow-400">
                  {inventory.filter(item => item.rarity === 'legendary').length}
                </div>
                <div className="text-xs text-gray-400">Legendary</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-3">
                <div className="text-xl font-bold text-purple-400">
                  {inventory.filter(item => item.rarity === 'epic').length}
                </div>
                <div className="text-xs text-gray-400">Epic</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-3">
                <div className="text-xl font-bold text-green-400">
                  {inventory.filter(item => item.type === 'artifact').length}
                </div>
                <div className="text-xs text-gray-400">Artifacts</div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Grid */}
          {inventory.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  Empty Inventory
                </h3>
                <p className="text-sm text-gray-500">
                  Complete challenges and explore cultural regions to collect artifacts and knowledge!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {inventory.map((item) => {
                const Icon = getItemIcon(item.type);
                
                return (
                  <Card key={item.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          item.rarity === 'legendary' ? 'bg-yellow-400/20' :
                          item.rarity === 'epic' ? 'bg-purple-400/20' :
                          item.rarity === 'rare' ? 'bg-blue-400/20' :
                          'bg-gray-600/20'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            item.rarity === 'legendary' ? 'text-yellow-400' :
                            item.rarity === 'epic' ? 'text-purple-400' :
                            item.rarity === 'rare' ? 'text-blue-400' :
                            'text-gray-400'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getItemColor(item.rarity)}`}
                            >
                              {item.rarity}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className="text-xs text-gray-400 border-gray-500"
                            >
                              {item.culture}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
