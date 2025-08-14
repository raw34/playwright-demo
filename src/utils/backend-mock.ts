import { MessageSigningService } from './message-signing';
import { ethers } from 'ethers';

export interface SubmissionData {
  data: Record<string, any>;
  signature: string;
  signerAddress: string;
  signedMessage: string;
  timestamp?: number;
}

export interface VerificationResult {
  isValid: boolean;
  signerAddress?: string;
  expectedAddress?: string;
  error?: string;
  data?: any;
}

/**
 * Mock backend service for signature verification
 * This simulates server-side validation logic
 */
export class BackendMockService {
  private trustedAddresses: Set<string>;
  private submissions: SubmissionData[] = [];

  constructor(trustedAddresses: string[] = []) {
    this.trustedAddresses = new Set(
      trustedAddresses.map(addr => addr.toLowerCase())
    );
  }

  /**
   * Add a trusted address
   */
  addTrustedAddress(address: string) {
    this.trustedAddresses.add(address.toLowerCase());
  }

  /**
   * Remove a trusted address
   */
  removeTrustedAddress(address: string) {
    this.trustedAddresses.delete(address.toLowerCase());
  }

  /**
   * Verify a submission with signature
   */
  async verifySubmission(submission: SubmissionData): Promise<VerificationResult> {
    try {
      // 1. Verify the signature
      const isSignatureValid = MessageSigningService.verifySignature(
        submission.signedMessage,
        submission.signature,
        submission.signerAddress
      );

      if (!isSignatureValid) {
        return {
          isValid: false,
          error: 'Invalid signature',
        };
      }

      // 2. Check if signer is trusted (optional)
      if (this.trustedAddresses.size > 0) {
        const signerLower = submission.signerAddress.toLowerCase();
        if (!this.trustedAddresses.has(signerLower)) {
          return {
            isValid: false,
            signerAddress: submission.signerAddress,
            error: 'Signer is not in trusted addresses list',
          };
        }
      }

      // 3. Verify message content matches data
      let messageData;
      try {
        messageData = JSON.parse(submission.signedMessage);
      } catch (e) {
        return {
          isValid: false,
          error: 'Invalid message format',
        };
      }

      // 4. Check timestamp (prevent replay attacks)
      if (messageData.timestamp) {
        const messageTime = new Date(messageData.timestamp).getTime();
        const currentTime = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (currentTime - messageTime > fiveMinutes) {
          return {
            isValid: false,
            error: 'Message timestamp is too old (expired)',
          };
        }
      }

      // 5. Store valid submission
      this.submissions.push({
        ...submission,
        timestamp: Date.now(),
      });

      return {
        isValid: true,
        signerAddress: submission.signerAddress,
        data: messageData,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Verification failed: ${error}`,
      };
    }
  }

  /**
   * Verify EIP-712 typed data signature
   */
  async verifyTypedDataSubmission(
    domain: ethers.TypedDataDomain,
    types: Record<string, ethers.TypedDataField[]>,
    value: Record<string, any>,
    signature: string,
    expectedAddress: string
  ): Promise<VerificationResult> {
    try {
      const isValid = MessageSigningService.verifyTypedData(
        domain,
        types,
        value,
        signature,
        expectedAddress
      );

      if (!isValid) {
        return {
          isValid: false,
          error: 'Invalid typed data signature',
        };
      }

      // Check if signer is trusted
      if (this.trustedAddresses.size > 0) {
        const signerLower = expectedAddress.toLowerCase();
        if (!this.trustedAddresses.has(signerLower)) {
          return {
            isValid: false,
            signerAddress: expectedAddress,
            error: 'Signer is not in trusted addresses list',
          };
        }
      }

      return {
        isValid: true,
        signerAddress: expectedAddress,
        data: value,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Typed data verification failed: ${error}`,
      };
    }
  }

  /**
   * Get all valid submissions
   */
  getSubmissions(): SubmissionData[] {
    return [...this.submissions];
  }

  /**
   * Clear all submissions
   */
  clearSubmissions() {
    this.submissions = [];
  }

  /**
   * Check if a specific address has submitted
   */
  hasSubmissionFrom(address: string): boolean {
    const addrLower = address.toLowerCase();
    return this.submissions.some(
      sub => sub.signerAddress.toLowerCase() === addrLower
    );
  }

  /**
   * Get submissions from a specific address
   */
  getSubmissionsFrom(address: string): SubmissionData[] {
    const addrLower = address.toLowerCase();
    return this.submissions.filter(
      sub => sub.signerAddress.toLowerCase() === addrLower
    );
  }

  /**
   * Simulate API endpoint for submission
   */
  async handleApiSubmission(
    requestBody: any
  ): Promise<{ success: boolean; message: string; data?: any }> {
    // Extract submission data from request
    const submission: SubmissionData = {
      data: requestBody.data || {},
      signature: requestBody.signature,
      signerAddress: requestBody.signerAddress,
      signedMessage: requestBody.signedMessage,
    };

    // Verify the submission
    const result = await this.verifySubmission(submission);

    if (result.isValid) {
      return {
        success: true,
        message: 'Submission verified and accepted',
        data: {
          submissionId: this.generateSubmissionId(),
          signerAddress: result.signerAddress,
          timestamp: Date.now(),
        },
      };
    } else {
      return {
        success: false,
        message: result.error || 'Verification failed',
      };
    }
  }

  /**
   * Generate a unique submission ID
   */
  private generateSubmissionId(): string {
    return `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}