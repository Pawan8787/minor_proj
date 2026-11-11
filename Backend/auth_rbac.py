"""
Role-Based Access Control (RBAC) Module for Digital Road Register.
Enforces permission tiers:
- Admin: Full system access, rules engine configuration, officer assignment
- RMC_Officer: Municipal officers, work order approvals, reports export, status updates
- Field_Engineer: Survey video upload, field verification, on-ground resolution
- Viewer: Public/Observer read-only map and digital register access
"""

USERS_DB = {
    "admin@rmc.gov.in": {
        "name": "Dr. R. K. Singhal",
        "email": "admin@rmc.gov.in",
        "role": "Admin",
        "designation": "Chief Technology Officer & System Administrator",
        "department": "Municipal IT & Infrastructure",
        "permissions": ["all"]
    },
    "officer@rmc.gov.in": {
        "name": "Er. Rajesh Verma",
        "email": "officer@rmc.gov.in",
        "role": "RMC_Officer",
        "designation": "Executive Engineer (EE), PWD & RMC",
        "department": "Road Infrastructure & Drainage Division",
        "permissions": ["view_dashboard", "manage_register", "update_defects", "export_reports"]
    },
    "engineer@rmc.gov.in": {
        "name": "Er. Priya Patel",
        "email": "engineer@rmc.gov.in",
        "role": "Field_Engineer",
        "designation": "Sub-Divisional Officer (SDO) - Field Survey",
        "department": "Ward Inspection & Quality Control",
        "permissions": ["view_dashboard", "run_ai_survey", "resolve_defects", "export_reports"]
    },
    "viewer@public.gov.in": {
        "name": "Public Citizen / Guest Auditor",
        "email": "viewer@public.gov.in",
        "role": "Viewer",
        "designation": "Public Viewer",
        "department": "Citizen Oversight",
        "permissions": ["view_dashboard", "view_register", "view_map"]
    }
}

ROLE_PERMISSIONS = {
    "Admin": ["all"],
    "RMC_Officer": ["view_dashboard", "manage_register", "update_defects", "export_reports", "run_ai_survey"],
    "Field_Engineer": ["view_dashboard", "run_ai_survey", "resolve_defects", "export_reports"],
    "Viewer": ["view_dashboard", "view_register", "view_map"]
}

def authenticate_user(email_or_role):
    # Match by email or role name for easy testing
    for email, user in USERS_DB.items():
        if email.lower() == str(email_or_role).lower() or user["role"].lower() == str(email_or_role).lower():
            return user
            
    # Default to Viewer if unknown
    return USERS_DB["viewer@public.gov.in"]

def check_permission(user_role, required_permission):
    if user_role == "Admin":
        return True
    perms = ROLE_PERMISSIONS.get(user_role, [])
    return required_permission in perms or "all" in perms

