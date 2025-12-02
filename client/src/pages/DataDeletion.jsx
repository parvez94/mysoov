import styled from 'styled-components';
import { FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #fff;
  min-height: calc(100vh - var(--navbar-h));

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 40px;
  text-align: center;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 30px;
`;

const IconWrapper = styled.div`
  font-size: 48px;
  color: var(--primary-color);
  margin-bottom: 16px;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const Title = styled.h1`
  font-family: var(--secondary-fonts);
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-family: var(--primary-fonts);
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
`;

const Section = styled.section`
  margin-bottom: 40px;

  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

const SectionTitle = styled.h2`
  font-family: var(--secondary-fonts);
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const SectionContent = styled.div`
  font-family: var(--primary-fonts);
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;

  p {
    margin-bottom: 16px;
  }

  ul, ol {
    margin: 16px 0;
    padding-left: 24px;
  }

  li {
    margin-bottom: 12px;
  }

  strong {
    color: #fff;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const WarningBox = styled.div`
  background-color: rgba(255, 193, 7, 0.1);
  border-left: 4px solid #ffc107;
  padding: 20px;
  margin: 24px 0;
  border-radius: 4px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

const WarningIcon = styled.div`
  color: #ffc107;
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
`;

const WarningText = styled.div`
  font-family: var(--primary-fonts);
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
`;

const ContactBox = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  border-radius: 8px;
  margin-top: 24px;
`;

const ContactTitle = styled.h3`
  font-family: var(--secondary-fonts);
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
`;

const ContactText = styled.p`
  font-family: var(--primary-fonts);
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DataDeletion = () => {
  return (
    <Container>
      <Header>
        <IconWrapper>
          <FaTrashAlt />
        </IconWrapper>
        <Title>Data Deletion Request</Title>
        <Subtitle>How to request deletion of your Mysoov data</Subtitle>
      </Header>

      <Section>
        <SectionTitle>Overview</SectionTitle>
        <SectionContent>
          <p>
            If you've used your Facebook account to log in to Mysoov, you can
            request deletion of your data at any time. We respect your privacy
            and are committed to handling your data deletion requests promptly.
          </p>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>How to Delete Your Data</SectionTitle>
        <SectionContent>
          <p>
            There are two ways to request deletion of your Mysoov data:
          </p>
          
          <strong>Option 1: Delete Through Your Mysoov Account</strong>
          <ol>
            <li>Log in to your Mysoov account</li>
            <li>Go to your account settings</li>
            <li>Navigate to the "Privacy & Security" section</li>
            <li>Click on "Delete Account"</li>
            <li>Follow the confirmation steps</li>
          </ol>

          <strong>Option 2: Contact Us Directly</strong>
          <ol>
            <li>Send an email to <strong>privacy@mysoov.com</strong></li>
            <li>Include your Facebook user ID or the email associated with your account</li>
            <li>Clearly state your request to delete your data</li>
            <li>We will process your request within 30 days</li>
          </ol>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>What Data Will Be Deleted</SectionTitle>
        <SectionContent>
          <p>
            When you request data deletion, we will remove the following
            information associated with your account:
          </p>
          <ul>
            <li>Your account profile information</li>
            <li>Your uploaded videos and content</li>
            <li>Your comments and interactions</li>
            <li>Your viewing history and preferences</li>
            <li>Any other personal data linked to your account</li>
          </ul>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Data Retention</SectionTitle>
        <SectionContent>
          <p>
            Please note that some data may be retained for a limited period due
            to legal obligations or legitimate business interests, such as:
          </p>
          <ul>
            <li>Transaction records for financial compliance (up to 7 years)</li>
            <li>Security logs for fraud prevention (up to 90 days)</li>
            <li>Backup copies (automatically purged within 90 days)</li>
          </ul>
        </SectionContent>
      </Section>

      <WarningBox>
        <WarningIcon>
          <FaExclamationTriangle />
        </WarningIcon>
        <WarningText>
          <strong>Important:</strong> Data deletion is permanent and cannot be
          undone. Once your data is deleted, you will not be able to recover
          your account, videos, or any other content associated with your
          account. Please make sure to download any content you wish to keep
          before requesting deletion.
        </WarningText>
      </WarningBox>

      <Section>
        <SectionTitle>Processing Time</SectionTitle>
        <SectionContent>
          <p>
            We aim to process all data deletion requests within <strong>30 days</strong> of
            receiving your request. You will receive a confirmation email once
            your data has been deleted.
          </p>
        </SectionContent>
      </Section>

      <ContactBox>
        <ContactTitle>Need Help?</ContactTitle>
        <ContactText>
          If you have any questions about data deletion or need assistance with
          your request, please contact us:
        </ContactText>
        <ContactText>
          <strong>Email:</strong> privacy@mysoov.com
        </ContactText>
        <ContactText>
          <strong>Subject Line:</strong> Data Deletion Request - [Your Facebook User ID or Email]
        </ContactText>
      </ContactBox>
    </Container>
  );
};

export default DataDeletion;
