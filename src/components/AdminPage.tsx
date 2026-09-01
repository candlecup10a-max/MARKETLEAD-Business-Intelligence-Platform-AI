import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  Server,
  Activity,
  ArrowRight,
  Shield,
  FileCheck2,
  Radar,
  Building2,
  Users,
  Database,
  UserCheck,
  UserX,
  UserPlus,
  Settings,
  Search,
  Trash2,
  Edit3,
  Check,
  X,
  Unlock,
  MessageSquare,
  Bot,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Globe
} from 'lucide-react';
import { MarketLeadLogo } from './MarketLeadLogo';
import { AdminUser, AdminUserRole, UserAccountStatus, BusinessType } from '../types';
import {
  fetchAllUsersFromFirestore,
  saveUserToFirestore,
  updateUserStatusInFirestore,
  updateUserPermissionsInFirestore,
  deleteUserFromFirestore,
  subscribeToUsers
} from '../services/firestoreService';

interface AdminPageProps {
  currentUser: AdminUser | null;
  onLogin: (user: AdminUser) => void;
  onLogout: () => void;
  onNavigateTab: (tab: 'scraper' | 'company' | 'catalog' | 'conversations' | 'proposals') => void;
  selectedBusinessType: BusinessType;
  totalDemandsCount: number;
}

const PRESET_ADMINS: {
  role: AdminUserRole;
  name: string;
  email: string;
  pass: string;
  badgeColor: string;
  permissions: string[];
}[] = [
  {
    role: 'Super Admin',
    name: 'Sarah Chen',
    email: 'admin@marketlead.io',
    pass: 'admin123',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    permissions: [
      'Full System Scraper Access',
      'A2A Agent Orchestration',
      'Database Export',
      'Financial Proposals Approval',
      'User & Team Management',
    ],
  },
  {
    role: 'Lead Ops Manager',
    name: 'Marcus Vance',
    email: 'ops@marketlead.io',
    pass: 'leadops2026',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    permissions: [
      'Web Scraper Execution',
      'Country Filter Management',
      'Demand Enrichment',
      'Outreach Queue',
    ],
  },
  {
    role: 'Commercial Executive',
    name: 'Elena Rostova',
    email: 'exec@marketlead.io',
    pass: 'execmarket',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    permissions: [
      'Proposal Vault',
      'Direct Client Negotiation',
      'Won Deals Tracking',
      'Executive Analytics',
    ],
  },
];

const INITIAL_ROSTER_USERS: AdminUser[] = [
  {
    id: 'ADM-SUP-01',
    name: 'Sarah Chen',
    email: 'admin@marketlead.io',
    role: 'Super Admin',
    status: 'Active',
    department: 'Executive Leadership',
    lastLogin: 'Today at 09:42 AM',
    dateAdded: '2025-11-12',
    permissions: [
      'Full System Scraper Access',
      'A2A Agent Orchestration',
      'Database Export',
      'Financial Proposals Approval',
      'User & Team Management',
    ],
    allowedModules: [
      'Web Scraper & Demands Engine',
      'Company Profile & A2A',
      'Real Demand Verification',
      'Commercial Proposal Vault',
      'Conversations & Outreach Hub',
      'Database CSV & JSON Export',
      'User & Team Management',
    ],
    accessLevel: 'Full Root Access',
  },
  {
    id: 'ADM-OPS-02',
    name: 'Marcus Vance',
    email: 'ops@marketlead.io',
    role: 'Lead Ops Manager',
    status: 'Active',
    department: 'Data Operations',
    lastLogin: 'Yesterday at 04:15 PM',
    dateAdded: '2026-01-10',
    permissions: [
      'Web Scraper Execution',
      'Country Filter Management',
      'Demand Enrichment',
      'Outreach Queue',
    ],
    allowedModules: [
      'Web Scraper & Demands Engine',
      'Real Demand Verification',
      'Conversations & Outreach Hub',
    ],
    accessLevel: 'Restricted Operational',
  },
  {
    id: 'ADM-EXE-03',
    name: 'Elena Rostova',
    email: 'exec@marketlead.io',
    role: 'Commercial Executive',
    status: 'Active',
    department: 'Enterprise Sales',
    lastLogin: '3 days ago',
    dateAdded: '2026-02-01',
    permissions: [
      'Proposal Vault',
      'Direct Client Negotiation',
      'Won Deals Tracking',
      'Executive Analytics',
    ],
    allowedModules: [
      'Commercial Proposal Vault',
      'Conversations & Outreach Hub',
      'Database CSV & JSON Export',
    ],
    accessLevel: 'Commercial Only',
  },
  {
    id: 'ADM-SCP-04',
    name: 'David Miller',
    email: 'david.m@marketlead.io',
    role: 'Scraper Specialist',
    status: 'Active',
    department: 'Market Intelligence',
    lastLogin: '5 days ago',
    dateAdded: '2026-02-15',
    permissions: [
      'Web Scraper Execution',
      'Category Catalog Maintenance',
    ],
    allowedModules: [
      'Web Scraper & Demands Engine',
      'Real Demand Verification',
    ],
    accessLevel: 'Restricted Operational',
  },
  {
    id: 'ADM-AUD-05',
    name: 'Maya Lin',
    email: 'auditor@partner.org',
    role: 'Read-Only Auditor',
    status: 'Active',
    department: 'Compliance & Audit',
    lastLogin: '1 week ago',
    dateAdded: '2026-02-20',
    permissions: [
      'Audit Trail Review',
      'Read-Only Pipeline Inspection',
    ],
    allowedModules: [
      'Web Scraper & Demands Engine',
      'Commercial Proposal Vault',
    ],
    accessLevel: 'View Only',
  },
  {
    id: 'ADM-CTR-06',
    name: 'Alex Turner',
    email: 'alex.temp@marketlead.io',
    role: 'Scraper Specialist',
    status: 'Deactivated',
    department: 'Contractor Pool',
    lastLogin: '2026-01-20',
    dateAdded: '2025-12-01',
    deactivatedReason: 'Contract concluded. Workstation credentials suspended by Super Admin.',
    deactivatedAt: '2026-01-31T18:00:00Z',
    permissions: [
      'Web Scraper Execution',
    ],
    allowedModules: [
      'Web Scraper & Demands Engine',
    ],
    accessLevel: 'Restricted Operational',
  },
  {
    id: 'ADM-CLOUD-07',
    name: 'Cloud Administrator',
    email: 'aisay.company@gmail.com',
    role: 'Super Admin',
    status: 'Active',
    department: 'Cloud Infrastructure',
    lastLogin: 'Just now',
    dateAdded: '2025-10-01',
    permissions: [
      'Full System Scraper Access',
      'A2A Agent Orchestration',
      'Database Export',
      'Financial Proposals Approval',
      'User & Team Management',
    ],
    allowedModules: [
      'Web Scraper & Demands Engine',
      'Company Profile & A2A',
      'Real Demand Verification',
      'Commercial Proposal Vault',
      'Conversations & Outreach Hub',
      'Database CSV & JSON Export',
      'User & Team Management',
    ],
    accessLevel: 'Full Root Access',
  },
];

const AVAILABLE_MODULES: {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
}[] = [
  {
    id: 'Web Scraper & Demands Engine',
    name: 'Web Scraper & Demands Engine',
    description: 'Execute live multi-source web scraping, ISO country filtering (249 regions), and RFP extraction.',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    id: 'Company Profile & A2A',
    name: 'Company Profile & A2A Engine',
    description: 'Manage company catalog, pricing guidelines, and execute autonomous M2M agent handshakes.',
    badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  },
  {
    id: 'Real Demand Verification',
    name: 'Real Demand & RFP AI Verification',
    description: 'Run Gemini AI buying intent validation, entity extraction, and authenticity scoring.',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'Commercial Proposal Vault',
    name: 'Commercial Proposal Vault & Editor',
    description: 'Create, edit, price, and export formal client proposal dockets and scopes of work.',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  {
    id: 'Conversations & Outreach Hub',
    name: 'Conversations & Multi-Channel Outreach',
    description: 'Dispatch Email, WhatsApp, and direct outreach logs with communication histories.',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    id: 'Database CSV & JSON Export',
    name: 'Database CSV & JSON Lead Export',
    description: 'Export structured buyer leads, CRM history, and company databases to CSV / JSON.',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'User & Team Management',
    name: 'User & Team Access Control (Admin)',
    description: 'Activate / deactivate user accounts, grant module permissions, and manage team access.',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
  },
];

export const AdminPage: React.FC<AdminPageProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onNavigateTab,
  selectedBusinessType,
  totalDemandsCount,
}) => {
  // Login form state
  const [email, setEmail] = useState('admin@marketlead.io');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<AdminUserRole>('Super Admin');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Users Roster State
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ROSTER_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Deactivated' | 'Super Admin'>('All');
  
  // Modals & Drawers
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [deactivatingUser, setDeactivatingUser] = useState<AdminUser | null>(null);
  const [deactivationReasonInput, setDeactivationReasonInput] = useState('Access suspended by Administrator');
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AdminUser | null>(null);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDepartment, setNewDepartment] = useState('Operations');
  const [newRole, setNewRole] = useState<AdminUserRole>('Lead Ops Manager');
  const [newStatus, setNewStatus] = useState<UserAccountStatus>('Active');
  const [newModules, setNewModules] = useState<string[]>([
    'Web Scraper & Demands Engine',
    'Real Demand Verification',
    'Conversations & Outreach Hub',
  ]);

  // Firestore Live Listener for Users Roster
  useEffect(() => {
    // Initial fetch from Firestore
    fetchAllUsersFromFirestore().then((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers((prev) => {
          const map = new Map<string, AdminUser>(prev.map((u) => [u.id, u]));
          cloudUsers.forEach((cu) => {
            map.set(cu.id, { ...map.get(cu.id), ...cu });
          });
          return Array.from(map.values());
        });
      }
    });

    const unsubscribe = subscribeToUsers((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers((prev) => {
          const map = new Map<string, AdminUser>(prev.map((u) => [u.id, u]));
          cloudUsers.forEach((cu) => {
            const existing = map.get(cu.id);
            map.set(cu.id, { ...existing, ...cu });
          });
          return Array.from(map.values());
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Quick preset login handler
  const handleSelectPreset = (preset: (typeof PRESET_ADMINS)[0]) => {
    setEmail(preset.email);
    setPassword(preset.pass);
    setRole(preset.role);
    setErrorMsg(null);
  };

  // Submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter a valid administrator email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your administrator password.');
      return;
    }

    // Check if account is deactivated in our system
    const targetUser = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (targetUser && targetUser.status === 'Deactivated') {
      setErrorMsg(
        `Access Denied: The account "${targetUser.name}" (${targetUser.email}) has been deactivated by the Super Administrator. Reason: ${targetUser.deactivatedReason || 'Account suspended'}`
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const matchedPreset = PRESET_ADMINS.find(
        (p) => p.email.toLowerCase() === email.trim().toLowerCase()
      );

      const authenticatedUser: AdminUser = {
        id: targetUser?.id || (matchedPreset ? `ADM-${matchedPreset.role.substring(0, 3).toUpperCase()}-01` : 'ADM-USR-99'),
        name: targetUser?.name || (matchedPreset ? matchedPreset.name : email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase())),
        email: email.trim(),
        role: targetUser?.role || role,
        status: targetUser?.status || 'Active',
        lastLogin: 'Just now',
        permissions: targetUser?.permissions || (matchedPreset ? matchedPreset.permissions : ['Web Scraper Execution', 'Customer Outreach', 'Proposal Management']),
        allowedModules: targetUser?.allowedModules || [
          'Web Scraper & Demands Engine',
          'Company Profile & A2A',
          'Real Demand Verification',
          'Commercial Proposal Vault',
          'Conversations & Outreach Hub',
        ],
      };

      // Save login update
      saveUserToFirestore(authenticatedUser).catch(() => {});
      onLogin(authenticatedUser);
      setSuccessNotice(`Welcome back, ${authenticatedUser.name}!`);
    }, 500);
  };

  // Activate User Handler
  const handleActivateUser = async (user: AdminUser) => {
    const updated: AdminUser = {
      ...user,
      status: 'Active',
      deactivatedReason: undefined,
      deactivatedAt: undefined,
    };

    setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    setSuccessNotice(`User "${user.name}" (${user.email}) has been successfully ACTIVATED.`);
    setTimeout(() => setSuccessNotice(null), 4000);

    try {
      await updateUserStatusInFirestore(user.id, 'Active');
    } catch (err) {
      console.warn('Firestore user activation error:', err);
    }
  };

  // Open Deactivation Prompt
  const handleOpenDeactivateModal = (user: AdminUser) => {
    setDeactivatingUser(user);
    setDeactivationReasonInput('Access suspended by Administrator');
  };

  // Confirm Deactivate User Handler
  const handleConfirmDeactivate = async () => {
    if (!deactivatingUser) return;
    const reason = deactivationReasonInput.trim() || 'Access suspended by Administrator';

    const updated: AdminUser = {
      ...deactivatingUser,
      status: 'Deactivated',
      deactivatedReason: reason,
      deactivatedAt: new Date().toISOString(),
    };

    setUsers((prev) => prev.map((u) => (u.id === deactivatingUser.id ? updated : u)));
    setSuccessNotice(`User "${deactivatingUser.name}" has been DEACTIVATED.`);
    setTimeout(() => setSuccessNotice(null), 4000);

    const targetId = deactivatingUser.id;
    setDeactivatingUser(null);

    try {
      await updateUserStatusInFirestore(targetId, 'Deactivated', reason);
    } catch (err) {
      console.warn('Firestore user deactivation error:', err);
    }
  };

  // Save Permissions & Access Changes
  const handleSaveUserAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setSuccessNotice(`Access permissions updated for "${editingUser.name}".`);
    setTimeout(() => setSuccessNotice(null), 4000);

    const userToSave = { ...editingUser };
    setEditingUser(null);

    try {
      await updateUserPermissionsInFirestore(userToSave.id, {
        role: userToSave.role,
        status: userToSave.status,
        department: userToSave.department,
        permissions: userToSave.permissions,
        allowedModules: userToSave.allowedModules,
        accessLevel: userToSave.accessLevel,
      });
    } catch (err) {
      console.warn('Firestore permissions update error:', err);
    }
  };

  // Create & Add New User
  const handleAddNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    const newId = `ADM-${newRole.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    
    // Default permissions based on role
    const permissionsMap: Record<AdminUserRole, string[]> = {
      'Super Admin': ['Full System Scraper Access', 'A2A Agent Orchestration', 'Database Export', 'Financial Proposals Approval', 'User & Team Management'],
      'Lead Ops Manager': ['Web Scraper Execution', 'Country Filter Management', 'Demand Enrichment', 'Outreach Queue'],
      'Commercial Executive': ['Proposal Vault', 'Direct Client Negotiation', 'Won Deals Tracking', 'Executive Analytics'],
      'Scraper Specialist': ['Web Scraper Execution', 'Category Catalog Maintenance'],
      'Read-Only Auditor': ['Audit Trail Review', 'Read-Only Pipeline Inspection'],
    };

    const newUserObj: AdminUser = {
      id: newId,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      status: newStatus,
      department: newDepartment,
      dateAdded: new Date().toISOString().split('T')[0],
      lastLogin: 'Never logged in',
      permissions: permissionsMap[newRole] || ['Web Scraper Execution'],
      allowedModules: newModules,
      accessLevel: newRole === 'Super Admin' ? 'Full Root Access' : newRole === 'Read-Only Auditor' ? 'View Only' : 'Restricted Operational',
    };

    setUsers((prev) => [newUserObj, ...prev]);
    setSuccessNotice(`New user "${newUserObj.name}" (${newUserObj.email}) added successfully.`);
    setTimeout(() => setSuccessNotice(null), 4000);

    // Reset Form
    setNewName('');
    setNewEmail('');
    setNewDepartment('Operations');
    setNewRole('Lead Ops Manager');
    setNewStatus('Active');
    setNewModules(['Web Scraper & Demands Engine', 'Real Demand Verification', 'Conversations & Outreach Hub']);
    setIsAddUserOpen(false);

    try {
      await saveUserToFirestore(newUserObj);
    } catch (err) {
      console.warn('Firestore new user save error:', err);
    }
  };

  // Delete User
  const handleConfirmDelete = async () => {
    if (!deleteConfirmUser) return;
    const targetId = deleteConfirmUser.id;
    const targetName = deleteConfirmUser.name;

    setUsers((prev) => prev.filter((u) => u.id !== targetId));
    setDeleteConfirmUser(null);
    setSuccessNotice(`User "${targetName}" removed from system.`);
    setTimeout(() => setSuccessNotice(null), 4000);

    try {
      await deleteUserFromFirestore(targetId);
    } catch (err) {
      console.warn('Firestore user delete error:', err);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'Active') return u.status === 'Active';
    if (statusFilter === 'Deactivated') return u.status === 'Deactivated';
    if (statusFilter === 'Super Admin') return u.role === 'Super Admin';
    return true;
  });

  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status === 'Active').length;
  const deactivatedUsersCount = users.filter((u) => u.status === 'Deactivated').length;
  const superAdminCount = users.filter((u) => u.role === 'Super Admin').length;

  // =========================================================================
  // AUTHENTICATED VIEW: ADMIN DASHBOARD + TEAM ACCESS MANAGEMENT HUB
  // =========================================================================
  if (currentUser) {
    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Global Toast Success Message */}
        {successNotice && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3 text-emerald-900 font-semibold text-xs">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Admin Session Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-md text-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center space-x-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-teal-500/20 shrink-0">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-white">{currentUser.name}</h1>
                  <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                    {currentUser.role}
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active Session</span>
                  </span>
                </div>

                <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center space-x-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-mono">{currentUser.email}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Logged in: {currentUser.lastLogin}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                id="admin-logout-btn"
                onClick={onLogout}
                className="px-4 py-2.5 bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-300 border border-white/20 hover:border-rose-500/40 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION: USER & TEAM ACCESS MANAGEMENT (PRIMARY REQUEST) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          {/* Header & Action Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                  <Users className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  User & Team Access Management
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Control team permissions, activate/deactivate user accounts, and grant granular access to system modules.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddUserOpen(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Add Team Member</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Users</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalUsersCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Registered Workstations</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Active Users</span>
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{activeUsersCount}</div>
              <div className="text-[11px] text-emerald-600 mt-0.5">Full System Access</div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
              <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center space-x-1.5">
                <UserX className="h-3.5 w-3.5 text-rose-600" />
                <span>Deactivated</span>
              </div>
              <div className="text-2xl font-black text-rose-700 mt-1">{deactivatedUsersCount}</div>
              <div className="text-[11px] text-rose-600 mt-0.5">Access Suspended</div>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200">
              <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                <span>Super Admins</span>
              </div>
              <div className="text-2xl font-black text-teal-800 mt-1">{superAdminCount}</div>
              <div className="text-[11px] text-teal-700 mt-0.5">Elevated Root Roles</div>
            </div>
          </div>

          {/* Search Bar & Filter Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, department..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {(['All', 'Active', 'Deactivated', 'Super Admin'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === tab
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab === 'All' && `All (${totalUsersCount})`}
                  {tab === 'Active' && `Active (${activeUsersCount})`}
                  {tab === 'Deactivated' && `Deactivated (${deactivatedUsersCount})`}
                  {tab === 'Super Admin' && `Super Admins (${superAdminCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Users Roster Table / Card Roster */}
          <div className="space-y-3">
            {filteredUsers.map((user) => {
              const isActive = user.status === 'Active';
              const isCurrentUser = currentUser.email.toLowerCase() === user.email.toLowerCase();
              const grantedModules = user.allowedModules || [];

              return (
                <div
                  key={user.id}
                  className={`p-4 md:p-5 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      : 'bg-slate-50 border-rose-200/80 shadow-2xs opacity-90'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* User Identity & Info */}
                    <div className="flex items-start space-x-3.5">
                      <div
                        className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                          isActive
                            ? 'bg-teal-50 text-teal-800 border-teal-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{user.name}</span>

                          {/* Status Badge */}
                          {isActive ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span>ACTIVE</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <Lock className="h-3 w-3 text-rose-600" />
                              <span>DEACTIVATED</span>
                            </span>
                          )}

                          {/* Role Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              user.role === 'Super Admin'
                                ? 'bg-teal-50 text-teal-800 border-teal-200'
                                : user.role === 'Lead Ops Manager'
                                ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                                : user.role === 'Commercial Executive'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : user.role === 'Scraper Specialist'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {user.role}
                          </span>

                          {isCurrentUser && (
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              You
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-mono text-slate-600">{user.email}</span>
                          <span>•</span>
                          <span>Dept: {user.department || 'Operations'}</span>
                          <span>•</span>
                          <span>Last login: {user.lastLogin || 'Recent'}</span>
                        </div>

                        {/* Deactivation Reason if Deactivated */}
                        {!isActive && user.deactivatedReason && (
                          <div className="mt-1.5 text-xs text-rose-800 bg-rose-50/80 p-2 rounded-lg border border-rose-200 flex items-start space-x-2">
                            <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Suspension Note:</strong> {user.deactivatedReason}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Authorized Modules Chips & Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {/* Authorized Modules Preview */}
                      <div className="space-y-1 text-left sm:text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Module Access ({grantedModules.length}/7)
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-xs justify-start sm:justify-end">
                          {grantedModules.slice(0, 3).map((m, idx) => (
                            <span
                              key={`mod-${idx}-${m}`}
                              className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[130px]"
                            >
                              {m.replace('Web Scraper & Demands Engine', 'Scraper').replace('Real Demand & RFP AI Verification', 'RFP Check').replace('Commercial Proposal Vault & Editor', 'Proposals')}
                            </span>
                          ))}
                          {grantedModules.length > 3 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                              +{grantedModules.length - 3} more
                            </span>
                          )}
                          {grantedModules.length === 0 && (
                            <span className="text-[10px] font-bold text-rose-600">No Modules Authorized</span>
                          )}
                        </div>
                      </div>

                      {/* Action Controls: Activate/Deactivate + Edit Permissions */}
                      <div className="flex items-center space-x-2 shrink-0">
                        {/* TOGGLE ACTIVE / DEACTIVATE BUTTON */}
                        {isActive ? (
                          <button
                            type="button"
                            onClick={() => handleOpenDeactivateModal(user)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                            title="Suspend user access"
                          >
                            <UserX className="h-3.5 w-3.5" />
                            <span>Deactivate</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleActivateUser(user)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                            title="Restore active access"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Activate User</span>
                          </button>
                        )}

                        {/* EDIT ACCESS & PERMISSIONS BUTTON */}
                        <button
                          type="button"
                          onClick={() => setEditingUser({ ...user })}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Settings className="h-3.5 w-3.5 text-slate-500" />
                          <span>Give Access</span>
                        </button>

                        {/* DELETE BUTTON (Non-self) */}
                        {!isCurrentUser && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmUser(user)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6">
                <Users className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No matching users found</p>
                <p className="text-[11px] text-slate-500 mt-1">Try adjusting your search keyword or filter tab.</p>
              </div>
            )}
          </div>
        </div>

        {/* OPERATIONAL LAUNCHPAD & INFRASTRUCTURE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigateTab('scraper')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-teal-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Radar className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-teal-600 flex items-center space-x-1">
                <span>Launch</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-sm font-bold text-slate-900">Scraper & Demands Engine</div>
              <p className="text-xs text-slate-500 mt-1">
                {totalDemandsCount} live leads cached for {selectedBusinessType.business_type_name}.
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('company')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-teal-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-teal-600 flex items-center space-x-1">
                <span>Manage</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-sm font-bold text-slate-900">Company & A2A Profile</div>
              <p className="text-xs text-slate-500 mt-1">
                Configure corporate identity, services catalog, and A2A negotiation rules.
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('proposals')}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-teal-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-teal-600 flex items-center space-x-1">
                <span>Review</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
            <div className="mt-4">
              <div className="text-sm font-bold text-slate-900">Commercial Proposal Vault</div>
              <p className="text-xs text-slate-500 mt-1">
                Track tiered proposals, scope documents, and client negotiation milestones.
              </p>
            </div>
          </div>
        </div>

        {/* SYSTEM INFRASTRUCTURE STATUS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-900">System Infrastructure & Cloud Sync</h2>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cloud Firestore Synchronized</span>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Web Scraper Cluster</div>
              <div className="text-sm font-bold text-slate-900 mt-1">249 Regions Online</div>
              <div className="text-[11px] text-teal-600 mt-0.5">ISO 3166-1 Mesh</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">AI Grounding Core</div>
              <div className="text-sm font-bold text-slate-900 mt-1">Gemini 2.5 Active</div>
              <div className="text-[11px] text-teal-600 mt-0.5">Automated Match Scoring</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">A2A Handshake</div>
              <div className="text-sm font-bold text-slate-900 mt-1">v2.4 JSON-RPC</div>
              <div className="text-[11px] text-teal-600 mt-0.5">Mutual Token Auth</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Team Access Guard</div>
              <div className="text-sm font-bold text-slate-900 mt-1">{activeUsersCount} Active / {deactivatedUsersCount} Locked</div>
              <div className="text-[11px] text-emerald-600 mt-0.5">RBAC Enforced</div>
            </div>
          </div>
        </div>

        {/* MODAL 1: EDIT USER ACCESS & PERMISSIONS */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Configure Access & Permissions
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Grant or revoke module authorizations for <strong className="text-slate-800">{editingUser.name}</strong> ({editingUser.email})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUserAccess} className="space-y-4">
                {/* Role & Status Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Account Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, role: e.target.value as AdminUserRole })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    >
                      <option value="Super Admin">Super Admin (Full Root Access)</option>
                      <option value="Lead Ops Manager">Lead Ops Manager (Scraper & Enrichment)</option>
                      <option value="Commercial Executive">Commercial Executive (Proposals & Deals)</option>
                      <option value="Scraper Specialist">Scraper Specialist (Data Operations)</option>
                      <option value="Read-Only Auditor">Read-Only Auditor (Inspection Only)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Account Status</label>
                    <select
                      value={editingUser.status || 'Active'}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          status: e.target.value as UserAccountStatus,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    >
                      <option value="Active">🟢 Active (Access Enabled)</option>
                      <option value="Deactivated">🔴 Deactivated (Access Suspended)</option>
                      <option value="Pending Approval">🟡 Pending Approval</option>
                    </select>
                  </div>
                </div>

                {/* Quick Presets for Access */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Quick Permission Presets:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingUser({
                          ...editingUser,
                          allowedModules: AVAILABLE_MODULES.map((m) => m.id),
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-bold cursor-pointer"
                    >
                      ✓ Grant All Modules (7/7)
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingUser({
                          ...editingUser,
                          allowedModules: [
                            'Web Scraper & Demands Engine',
                            'Real Demand Verification',
                            'Conversations & Outreach Hub',
                          ],
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-[11px] font-bold cursor-pointer"
                    >
                      ⚡ Operations Preset
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingUser({
                          ...editingUser,
                          allowedModules: [
                            'Commercial Proposal Vault',
                            'Conversations & Outreach Hub',
                            'Database CSV & JSON Export',
                          ],
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-bold cursor-pointer"
                    >
                      💼 Commercial Preset
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingUser({
                          ...editingUser,
                          allowedModules: [],
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold cursor-pointer"
                    >
                      ✕ Revoke All
                    </button>
                  </div>
                </div>

                {/* Granular Module Access Checklist */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Granular Module Access Checkbox Matrix
                  </label>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {AVAILABLE_MODULES.map((mod) => {
                      const isChecked = (editingUser.allowedModules || []).includes(mod.id);
                      return (
                        <label
                          key={mod.id}
                          className={`flex items-start space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-teal-50/40 border-teal-300 shadow-2xs'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 opacity-70'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const current = editingUser.allowedModules || [];
                              const updated = e.target.checked
                                ? [...current, mod.id]
                                : current.filter((m) => m !== mod.id);
                              setEditingUser({ ...editingUser, allowedModules: updated });
                            }}
                            className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                              <span>{mod.name}</span>
                              {isChecked && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                                  AUTHORIZED
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{mod.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save Permissions & Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: DEACTIVATION REASON PROMPT */}
        {deactivatingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-3 text-rose-600">
                <div className="h-10 w-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                  <UserX className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Deactivate User Workstation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Suspend system access for <strong>{deactivatingUser.name}</strong>
                  </p>
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                Deactivating this user will immediately block all scraper, A2A handshake, and proposal actions associated with <span className="font-mono font-semibold">{deactivatingUser.email}</span>.
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Reason for Suspension (Logged for audit)</label>
                <input
                  type="text"
                  value={deactivationReasonInput}
                  onChange={(e) => setDeactivationReasonInput(e.target.value)}
                  placeholder="e.g. Contract completed, Security review, Role transition..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeactivatingUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeactivate}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Confirm Deactivation</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD NEW TEAM MEMBER */}
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Add New Team Member</h3>
                    <p className="text-[11px] text-slate-500">Create workstation credentials and assign initial permissions</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddNewUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Jordan Lee"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="jordan@marketlead.io"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as AdminUserRole)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Lead Ops Manager">Lead Ops Manager</option>
                      <option value="Commercial Executive">Commercial Executive</option>
                      <option value="Scraper Specialist">Scraper Specialist</option>
                      <option value="Read-Only Auditor">Read-Only Auditor</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Department</label>
                    <input
                      type="text"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      placeholder="e.g. Operations"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Initial Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as UserAccountStatus)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white"
                    >
                      <option value="Active">🟢 Active</option>
                      <option value="Pending Approval">🟡 Pending Approval</option>
                      <option value="Deactivated">🔴 Deactivated</option>
                    </select>
                  </div>
                </div>

                {/* Module Permissions Checkbox */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Authorized Modules</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AVAILABLE_MODULES.map((mod) => {
                      const isChecked = newModules.includes(mod.id);
                      return (
                        <label
                          key={`new-mod-${mod.id}`}
                          className={`flex items-center space-x-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                            isChecked ? 'bg-teal-50/60 border-teal-300 font-bold text-teal-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              setNewModules(
                                e.target.checked
                                  ? [...newModules, mod.id]
                                  : newModules.filter((m) => m !== mod.id)
                              );
                            }}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="truncate">{mod.name.replace('Web Scraper & Demands Engine', 'Web Scraper')}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Create Team Member</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: DELETE USER CONFIRMATION */}
        {deleteConfirmUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-3 text-rose-600">
                <div className="h-10 w-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Remove User</h3>
                  <p className="text-xs text-slate-500">
                    Permanently delete <strong>{deleteConfirmUser.name}</strong>
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete this user? Their login session and access rights will be permanently deleted from Firestore.
              </p>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmUser(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // UNAUTHENTICATED VIEW: SECURE ADMINISTRATOR SIGN IN GATEWAY
  // =========================================================================
  return (
    <div className="max-w-xl mx-auto py-8 px-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Top Visual Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-6 -mr-6 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white p-3 rounded-2xl shadow-lg mb-4">
              <MarketLeadLogo size="md" />
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Lock className="h-3 w-3" />
              <span>Admin Portal Gateway</span>
            </div>

            <h1 className="text-xl font-bold text-white">Administrator Sign In</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-sm">
              Sign in with your administrator credentials to access user management, scraper engine, and commercial suite.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Quick Demo Credentials Autofill Selector */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <KeyRound className="h-3 w-3 text-teal-600" />
                <span>Quick Demo Admin Accounts</span>
              </span>
              <span className="text-[10px] text-slate-400">Click to autofill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {PRESET_ADMINS.map((preset) => (
                <button
                  key={preset.role}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    email === preset.email
                      ? 'bg-teal-50 border-teal-600 text-teal-900 ring-1 ring-teal-600 font-semibold'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold truncate">{preset.role}</div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">{preset.email}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Administrator Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="admin-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@marketlead.io"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-xs"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <span className="text-[10px] text-slate-400">Encrypted</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-teal-600" />}
                </button>
              </div>
            </div>

            {/* Role selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Administrator Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminUserRole)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 shadow-xs"
                >
                  <option value="Super Admin">Super Admin (Full Root Access)</option>
                  <option value="Lead Ops Manager">Lead Ops Manager (Scraper & Enrichment)</option>
                  <option value="Commercial Executive">Commercial Executive (Proposals & Deals)</option>
                  <option value="Scraper Specialist">Scraper Specialist (Data Operations)</option>
                  <option value="Read-Only Auditor">Read-Only Auditor (Inspection Only)</option>
                </select>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Remember this workstation</span>
              </label>

              <span className="text-[11px] text-teal-700 font-medium">Internal Gateway Only</span>
            </div>

            {/* Submit button */}
            <button
              id="admin-submit-login-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Sign In with Admin Credentials</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
