class MultiDBRouter:
    """
    Database router that routes queries to the appropriate database based on app label.
    
    - PostgreSQL: users, jobs, auth, admin, contenttypes, sessions
    - MongoDB: resumes (handled directly via pymongo, not through Django ORM)
    - MySQL: analytics
    """
    
    def db_for_read(self, model, **hints):
        """
        Route read operations to the appropriate database.
        """
        app_label = model._meta.app_label
        
        # Django system apps use default database
        if app_label in ['auth', 'admin', 'contenttypes', 'sessions']:
            return 'default'
            
        # Business apps routing
        if app_label in ['users', 'jobs']:
            return 'default'  # PostgreSQL
        elif app_label == 'resumes':
            # Only route Django ORM models in resumes app to default
            # MongoDB models are handled directly through pymongo
            return 'default'
        elif app_label == 'analytics':
            return 'mysql'
            
        return 'default'
    
    def db_for_write(self, model, **hints):
        """
        Route write operations to the appropriate database.
        """
        app_label = model._meta.app_label
        
        # Django system apps use default database
        if app_label in ['auth', 'admin', 'contenttypes', 'sessions']:
            return 'default'
            
        # Business apps routing
        if app_label in ['users', 'jobs']:
            return 'default'  # PostgreSQL
        elif app_label == 'resumes':
            # Only route Django ORM models in resumes app to default
            # MongoDB models are handled directly through pymongo
            return 'default'
        elif app_label == 'analytics':
            return 'mysql'
            
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations between objects in the same database or 
        between objects in default database and any other.
        """
        # Always allow relations within the same app
        if obj1._meta.app_label == obj2._meta.app_label:
            return True
            
        # Allow relations between Django system apps and other apps
        # This is critical for auth permissions and content types
        if obj1._meta.app_label in ['auth', 'contenttypes'] or obj2._meta.app_label in ['auth', 'contenttypes']:
            return True
            
        # Allow relations between our defined apps
        allowed_apps = ['users', 'jobs', 'resumes', 'analytics']
        if obj1._meta.app_label in allowed_apps and obj2._meta.app_label in allowed_apps:
            return True
            
        return False
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Control which database migrations should run on.
        """
        # All Django system apps should migrate on default database
        if app_label in ['auth', 'admin', 'contenttypes', 'sessions']:
            return db == 'default'
            
        # Route migrations based on app
        if db == 'default' and app_label in ['users', 'jobs']:
            return True
        elif db == 'default' and app_label == 'resumes':
            # Allow all resumes models to migrate on default database
            # since MongoDB is handled directly via pymongo
            return True
        elif db == 'mysql' and app_label == 'analytics':
            return True
            
        # Prevent migrations on non-matching databases
        return False 