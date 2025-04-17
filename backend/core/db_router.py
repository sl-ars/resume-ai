class MultiDBRouter:
    """
    Database router that routes models to the appropriate database based on the app label.

    - PostgreSQL (default): users, jobs, resumes, auth, admin, contenttypes, sessions
    - MySQL: analytics (logs)
    - MongoDB is handled separately via pymongo, not through Django ORM.
    """

    postgresql_apps = {'auth', 'admin', 'contenttypes', 'sessions', 'users', 'jobs', 'resumes', 'companies'}
    mysql_apps = {'analytics'}

    def db_for_read(self, model, **hints):
        """
        Route read operations to the appropriate database.
        """
        app_label = model._meta.app_label

        if app_label in self.postgresql_apps:
            return 'default'
        elif app_label in self.mysql_apps:
            return 'mysql'
        return None

    def db_for_write(self, model, **hints):
        """
        Route write operations to the appropriate database.
        """
        app_label = model._meta.app_label

        if app_label in self.postgresql_apps:
            return 'default'
        elif app_label in self.mysql_apps:
            return 'mysql'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if both objects are from allowed apps.
        """
        app_label1 = obj1._meta.app_label
        app_label2 = obj2._meta.app_label

        if app_label1 == app_label2:
            return True

        if app_label1 in (self.postgresql_apps | self.mysql_apps) and app_label2 in (
                self.postgresql_apps | self.mysql_apps):
            return True

        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Ensure migrations occur on the correct database.
        """
        if app_label in self.postgresql_apps:
            return db == 'default'
        elif app_label in self.mysql_apps:
            return db == 'mysql'
        return None