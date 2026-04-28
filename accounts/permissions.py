"""
Admin permissions and decorators for Reading Room content management.
"""
from functools import wraps
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import HttpResponseForbidden


def admin_required(view_func):
    """
    Decorator to require admin/staff status for a view.
    Can be used to protect API endpoints for reading room management.
    """
    @wraps(view_func)
    @login_required
    @user_passes_test(lambda user: user.is_staff or user.is_superuser)
    def wrapped_view(request, *args, **kwargs):
        return view_func(request, *args, **kwargs)
    return wrapped_view


def superuser_required(view_func):
    """
    Decorator to require superuser status for a view.
    For sensitive operations like bulk deletion.
    """
    @wraps(view_func)
    @login_required
    @user_passes_test(lambda user: user.is_superuser)
    def wrapped_view(request, *args, **kwargs):
        return view_func(request, *args, **kwargs)
    return wrapped_view
