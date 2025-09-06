import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { userId, type, title, message, priority, data } = await request.json();

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notification = {
      userId,
      type,
      title,
      message,
      priority: priority || 'medium',
      data: data || {},
      read: false,
      createdAt: new Date(),
      scheduledFor: data?.scheduledFor || new Date()
    };

    const docRef = await addDoc(collection(db, 'notifications'), notification);

    return NextResponse.json({ 
      success: true, 
      notificationId: docRef.id,
      notification 
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limitCount = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (unreadOnly) {
      q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ notifications });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Helper functions for creating notifications (not exported to avoid Next.js route conflicts)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function createRepaymentReminder(
  userId: string, 
  investmentId: string, 
  companyName: string, 
  amount: number, 
  dueDate: Date,
  daysBefore: number = 3
) {
  try {
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - daysBefore);

    const notification = {
      userId,
      type: 'repayment_reminder',
      title: 'Repayment Due Soon',
      message: `Repayment of ${amount.toFixed(2)} APT from ${companyName} is due on ${dueDate.toLocaleDateString()}`,
      priority: 'high',
      data: {
        investmentId,
        companyName,
        amount,
        dueDate: dueDate.toISOString(),
        reminderDate: reminderDate.toISOString()
      },
      read: false,
      createdAt: new Date(),
      scheduledFor: reminderDate
    };

    const docRef = await addDoc(collection(db, 'notifications'), notification);
    return docRef.id;

  } catch (error) {
    console.error('Error creating repayment reminder:', error);
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function createOpportunityNotification(
  userId: string,
  opportunityData: {
    companyName: string;
    businessType: string;
    loanAmount: number;
    interestRate: number;
    matchReason: string;
  }
) {
  try {
    const notification = {
      userId,
      type: 'new_opportunity',
      title: 'New Investment Opportunity',
      message: `${opportunityData.companyName} (${opportunityData.businessType}) is seeking ${opportunityData.loanAmount} APT at ${opportunityData.interestRate}% interest. ${opportunityData.matchReason}`,
      priority: 'medium',
      data: {
        companyName: opportunityData.companyName,
        businessType: opportunityData.businessType,
        loanAmount: opportunityData.loanAmount,
        interestRate: opportunityData.interestRate,
        matchReason: opportunityData.matchReason
      },
      read: false,
      createdAt: new Date(),
      scheduledFor: new Date()
    };

    const docRef = await addDoc(collection(db, 'notifications'), notification);
    return docRef.id;

  } catch (error) {
    console.error('Error creating opportunity notification:', error);
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function createRiskAlert(
  userId: string,
  investmentId: string,
  companyName: string,
  riskLevel: string,
  riskFactors: string[]
) {
  try {
    const notification = {
      userId,
      type: 'risk_alert',
      title: `${riskLevel.toUpperCase()} Risk Alert`,
      message: `Investment in ${companyName} has been flagged for ${riskLevel} risk. Factors: ${riskFactors.join(', ')}`,
      priority: riskLevel === 'high' ? 'high' : 'medium',
      data: {
        investmentId,
        companyName,
        riskLevel,
        riskFactors
      },
      read: false,
      createdAt: new Date(),
      scheduledFor: new Date()
    };

    const docRef = await addDoc(collection(db, 'notifications'), notification);
    return docRef.id;

  } catch (error) {
    console.error('Error creating risk alert:', error);
    throw error;
  }
}
