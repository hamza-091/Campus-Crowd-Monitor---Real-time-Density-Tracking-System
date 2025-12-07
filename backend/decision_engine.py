class AutoDecisionEngine:
    """Intelligent auto-decision module for crowd management"""
    
    REROUTE_MAP = {
        "Cafeteria": ["Admin Block", "Academic Block"],
        "Admin Block": ["Academic Block", "Basketball Court"],
        "Academic Block": ["Admin Block", "Basketball Court"],
        "Basketball Court": ["Cafeteria", "Admin Block"]
    }
    
    WARNING_THRESHOLD = 0.80  # 80%
    CRITICAL_THRESHOLD = 1.0  # 100%
    
    @staticmethod
    def determine_status(current_count: int, capacity: int) -> str:
        """Determine location status based on capacity"""
        percentage = (current_count / capacity) * 100 if capacity > 0 else 0
        
        if current_count > capacity:
            return "CRITICAL"
        elif percentage >= AutoDecisionEngine.WARNING_THRESHOLD * 100:
            return "WARNING"
        return "NORMAL"
    
    @staticmethod
    def get_load_percentage(current_count: int, capacity: int) -> float:
        """Calculate load percentage"""
        return (current_count / capacity) * 100 if capacity > 0 else 0
    
    @staticmethod
    def find_best_reroute(location_name: str, available_locations: dict) -> str:
        """Find best reroute destination based on available capacity"""
        if location_name not in AutoDecisionEngine.REROUTE_MAP:
            return None
        
        candidates = AutoDecisionEngine.REROUTE_MAP[location_name]
        
        best_location = None
        best_capacity = -1
        
        for candidate in candidates:
            if candidate in available_locations:
                available = available_locations[candidate]['available_capacity']
                if available > 0 and available > best_capacity:
                    best_location = candidate
                    best_capacity = available
        
        return best_location
    
    @staticmethod
    def generate_alert_message(location_name: str, current_count: int, 
                              capacity: int, reroute_location: str = None) -> str:
        """Generate intelligent alert message"""
        percentage = AutoDecisionEngine.get_load_percentage(current_count, capacity)
        
        if current_count > capacity:
            message = f"{location_name} is overloaded ({current_count}/{capacity}). "
            message += "Entry has been closed automatically. "
            if reroute_location:
                available = capacity  # Should get this from db
                message += f"Visitors are being rerouted to {reroute_location}."
            return message
        elif percentage >= AutoDecisionEngine.WARNING_THRESHOLD * 100:
            return f"Crowd approaching limit in {location_name} ({int(percentage)}%). Please slow entry."
        
        return f"{location_name} operating normally."
