'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import Toast from '@/components/ui/Toast';
import ErrorState from '@/components/ui/ErrorState';
import TakeAttendanceSessionForm from '@/components/features/attendance/TakeAttendanceSessionForm';
import ActiveSessionHeader from '@/components/features/attendance/ActiveSessionHeader';
import NfcScannerBox from '@/components/features/attendance/NfcScannerBox';
import ScanFeedbackCard from '@/components/features/attendance/ScanFeedbackCard';
import OfflineSyncDrawer from '@/components/features/attendance/OfflineSyncDrawer';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { teacherApi } from '@/services/api';
import { getErrorMessage, isNetworkError } from '@/utils/errorHandler';

export default function TakeAttendancePage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [assignmentError, setAssignmentError] = useState(null);

  // Active Session state
  const [activeSession, setActiveSession] = useState(null);
  const [nfcInput, setNfcInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanFeedback, setScanFeedback] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Encapsulated offline sync hook
  const { pendingScans, isSyncing, sync, queueRecord } = useOfflineSync({
    sessionId: activeSession?.id,
    apiSubmitFn: teacherApi.markAttendance,
    onNotify: (t) => setToast(t),
  });

  const loadAssignments = async () => {
    setLoadingAssignments(true);
    setAssignmentError(null);
    try {
      const res = await teacherApi.getAssignments();
      const list = res.data?.data || [];
      setAssignments(list);
      if (list.length > 0) {
        const first = list[0];
        setSelectedAssignment(`${first.subject.id}|${first.batch.id}`);
      }
    } catch (err) {
      setAssignmentError(
        getErrorMessage(err, 'Unable to load course and batch assignments. Please retry.')
      );
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    const [subjectId, batchId] = selectedAssignment.split('|');

    try {
      const startDateTime = new Date(`${sessionDate}T${startTime}:00`).toISOString();
      const endDateTime = new Date(`${sessionDate}T${endTime}:00`).toISOString();

      const res = await teacherApi.createSession({
        subject_id: subjectId,
        batch_id: batchId,
        session_date: new Date(sessionDate).toISOString(),
        start_time: startDateTime,
        end_time: endDateTime,
      });

      const session = res.data.data;
      setActiveSession(session);
      setToast({
        message: 'Active attendance session started! Ready for NFC card taps.',
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: getErrorMessage(err, 'Failed to start session. Please try again.'),
        type: 'error',
      });
    }
  };

  const handleNfcScanSubmit = async (e) => {
    e.preventDefault();
    const tag = nfcInput.trim();
    if (!tag || !activeSession) return;

    setIsScanning(true);
    setScanFeedback(null);

    try {
      const res = await teacherApi.markAttendance({
        nfc_id: tag,
        session_id: activeSession.id,
      });

      const data = res.data.data;
      setScanFeedback({
        type: 'success',
        alreadyMarked: data.alreadyMarked,
        message: data.message || 'Attendance recorded successfully.',
        studentName: data.student?.name,
        enrollmentNo: data.student?.enrollmentNo,
        markedAt: new Date(data.markedAt || Date.now()).toLocaleTimeString(),
      });
      setNfcInput('');
    } catch (err) {
      const status = err.response?.status;
      const isConnectionIssue = isNetworkError(err) || !err.response || status >= 500;

      if (isConnectionIssue) {
        const queueRes = queueRecord({
          nfc_id: tag,
          session_id: activeSession.id,
          extra: {
            subjectName: activeSession.subject?.name,
            batchName: activeSession.batch?.name,
          },
        });

        setNfcInput('');
        setScanFeedback({
          type: 'offline',
          nfcId: tag,
          message: queueRes.message,
          markedAt: new Date().toLocaleTimeString(),
        });
        setToast({ message: queueRes.message, type: 'warning' });
      } else {
        const friendlyMsg = getErrorMessage(
          err,
          'NFC tag verification failed. Please verify student enrollment.'
        );
        setScanFeedback({ type: 'error', message: friendlyMsg });
        setToast({ message: friendlyMsg, type: 'error' });
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['TEACHER']}>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      <div className="max-w-3xl space-y-6">
        <PageHeader
          title="Take Attendance (NFC Scanner)"
          description="Create an active class session and tap NFC cards or tags to record student attendance."
        />

        <OfflineSyncDrawer
          pendingScans={pendingScans}
          isSyncing={isSyncing}
          onSync={sync}
        />

        {assignmentError && (
          <ErrorState
            title="Failed to Load Course Assignments"
            message={assignmentError}
            onRetry={loadAssignments}
          />
        )}

        {!activeSession ? (
          <TakeAttendanceSessionForm
            assignments={assignments}
            selectedAssignment={selectedAssignment}
            setSelectedAssignment={setSelectedAssignment}
            sessionDate={sessionDate}
            setSessionDate={setSessionDate}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            onSubmit={handleStartSession}
            loadingAssignments={loadingAssignments}
          />
        ) : (
          <div className="space-y-6">
            <ActiveSessionHeader
              session={activeSession}
              pendingCount={pendingScans.length}
              isSyncing={isSyncing}
              onSyncPending={sync}
              onEndSession={() => {
                setActiveSession(null);
                setScanFeedback(null);
              }}
            />

            <NfcScannerBox
              nfcInput={nfcInput}
              setNfcInput={setNfcInput}
              onSubmit={handleNfcScanSubmit}
              isScanning={isScanning}
            />

            <ScanFeedbackCard feedback={scanFeedback} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
